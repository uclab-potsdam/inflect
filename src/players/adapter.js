/**
 * PlayerAdapter - Unified video player interface
 * Supports YouTube, Vimeo, and HTML5 video via Plyr
 */

class PlayerAdapter {
  constructor(container, url) {
    this.container = container;
    this.url = url;
    this.player = null;
    this.ready = false;
    this.events = {};
    this.isProgrammaticSeek = false;
    this.segment = null; // {start, end, loop}
  }

  async load(url) {
    throw new Error('load() must be implemented by subclass');
  }

  play() {
    if (this.player) return this.player.play();
  }

  pause() {
    if (this.player) this.player.pause();
  }

  seek(seconds) {
    if (this.player) {
      this.isProgrammaticSeek = true;
      this.player.currentTime = seconds;
      setTimeout(() => { this.isProgrammaticSeek = false; }, 100);
    }
  }

  getCurrentTime() {
    return this.player ? this.player.currentTime : 0;
  }

  setVolume(vol) {
    if (this.player) this.player.volume = vol / 100;
  }

  setMuted(muted) {
    if (this.player) this.player.muted = muted;
  }

  setRate(rate) {
    if (this.player) this.player.speed = rate;
  }

  setLoop(loop) {
    if (this.player) this.player.loop = loop;
  }

  setSegment(start, end, loop = false) {
    this.segment = { start, end, loop };
    if (this.player && start !== null && start !== undefined) {
      this.seek(start);
    }
  }

  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }

  destroy() {
    if (this.player && this.player.destroy) {
      this.player.destroy();
    }
    this.player = null;
    this.ready = false;
    this.events = {};
  }

  _enforceSegmentLoop() {
    if (!this.segment || !this.segment.loop) return;
    const ct = this.getCurrentTime();
    if (this.segment.end && ct >= this.segment.end) {
      this.seek(this.segment.start || 0);
    }
  }
}

/**
 * PlyrAdapter - Plyr.js implementation for YouTube, Vimeo, HTML5
 */
class PlyrAdapter extends PlayerAdapter {
  async load(url) {
    // Detect provider
    let provider = 'html5';
    let videoId = url;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      provider = 'youtube';
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\/]+)/);
      if (match) videoId = match[1];
    } else if (url.includes('vimeo.com')) {
      provider = 'vimeo';
      const match = url.match(/vimeo\.com\/(\d+)/);
      if (match) videoId = match[1];
    }

    // Create element
    let element;
    if (provider === 'youtube') {
      element = document.createElement('div');
      element.setAttribute('data-plyr-provider', 'youtube');
      element.setAttribute('data-plyr-embed-id', videoId);
    } else if (provider === 'vimeo') {
      element = document.createElement('div');
      element.setAttribute('data-plyr-provider', 'vimeo');
      element.setAttribute('data-plyr-embed-id', videoId);
    } else {
      element = document.createElement('video');
      element.src = url;
    }

    this.container.appendChild(element);

    // Initialize Plyr
    this.player = new Plyr(element, {
      controls: [],
      clickToPlay: false,
      autoplay: false,
      muted: false,
      hideControls: true,
      keyboard: { focused: false, global: false },
      vimeo: {
        controls: false,
        keyboard: false,
        autopause: false,
        dnt: true
      },
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1
      }
    });

    this._wireEvents();

    return new Promise((resolve, reject) => {
      this.player.once('ready', () => {
        this.ready = true;
        console.log('[PlyrAdapter] Player ready');
        this.emit('ready');
        resolve();
      });
      this.player.once('error', (err) => {
        console.error('[PlyrAdapter] Player error', err);
        reject(err);
      });
    });
  }

  _wireEvents() {
    this.player.on('play', () => this.emit('play'));
    this.player.on('pause', () => this.emit('pause'));
    this.player.on('seeked', () => {
      if (!this.isProgrammaticSeek) {
        this.emit('seeked');
      }
    });
    this.player.on('timeupdate', () => {
      this._enforceSegmentLoop();
      this.emit('timeupdate');
    });
  }
}

// Export factory function
window.createAdapter = function(container, url) {
  return new PlyrAdapter(container, url);
};

console.log('[adapter.js] PlayerAdapter loaded, createAdapter available');
