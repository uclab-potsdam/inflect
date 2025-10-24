// External typewriter module
// Starts typing only for elements with the .typewriter class after they enter view
// and preserves anchors by typing into anchor.textContent without touching hrefs.
(function(){
  if (typeof window === 'undefined' || !document) return;

  // Inject minimal character fade-in CSS for typed characters
  const style = document.createElement('style');
  style.id = 'typewriter-external-style';
  style.textContent = `
/* Typed character fade-in */
.tw-char { display: inline; opacity: 0; transition: opacity 50ms linear; }
`;
  document.head.appendChild(style);

  // Helper: gather typable targets inside an element.
  function gatherTargets(el) {
    const targets = [];
    // iterate child nodes in document order
    for (let node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        const txt = node.textContent || '';
        if (txt.trim().length > 0) {
          // replace original text with empty text node to be filled
          const placeholder = document.createTextNode('');
          node.parentNode.replaceChild(placeholder, node);
          targets.push({ type: 'text', node: placeholder, chars: txt });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // If anchor (or other inline), type into its textContent but preserve element
        if (node.tagName.toLowerCase() === 'a') {
          const anchor = node;
          const txt = (anchor.textContent || '').trim();
          // store original and clear
          anchor.dataset._tw_orig = anchor.textContent || '';
          anchor.textContent = '';
          if (txt.length > 0) targets.push({ type: 'anchor', node: anchor, chars: txt });
        } else {
          // For other elements, try to recursively gather text nodes inside
          const innerText = node.textContent || '';
          if (innerText.trim().length > 0) {
            // We'll treat the whole element as a single typable unit and clear its text
            node.dataset._tw_orig = node.textContent || '';
            // Clear children
            while (node.firstChild) node.removeChild(node.firstChild);
            targets.push({ type: 'element', node: node, chars: innerText });
          }
        }
      }
    }
    return targets;
  }

  function startTypingForElement(el, opts) {
    if (!el || el.dataset._tw_started) return;
    el.dataset._tw_started = '1';
  // No DOM cursor: we intentionally avoid adding a blinking cursor element.
  // Measurements that previously relied on the cursor use a temporary
  // invisible marker inserted only for measurement and removed immediately.
  const speed = (opts && opts.speed) || (el.dataset.twSpeed ? parseInt(el.dataset.twSpeed,10) : 40); // ms per char
    // Measure final heights before we clear or replace content so layout doesn't jump.
    const measuredHeights = new Map();
    try {
      const elWidth = Math.max(0, Math.round(el.getBoundingClientRect().width));
      const clone = el.cloneNode(true);
      // Keep clone out of flow but renderable so we can measure
      clone.style.position = 'absolute';
      clone.style.left = '-99999px';
      clone.style.top = '0px';
      clone.style.visibility = 'hidden';
      clone.style.pointerEvents = 'none';
      clone.style.width = elWidth ? (elWidth + 'px') : '';
      document.body.appendChild(clone);

      const origChildren = Array.from(el.childNodes || []);
      const cloneChildren = Array.from(clone.childNodes || []);
      // If there are text nodes directly under el, measure the whole clone height and assign to the container once
      let containerHeightAssigned = false;
      for (let i = 0; i < origChildren.length; i++) {
        const o = origChildren[i];
        const c = cloneChildren[i];
        if (!c) continue;
        if (c.nodeType === Node.TEXT_NODE) {
          const txt = c.textContent || '';
          if (txt.trim().length > 0 && !containerHeightAssigned) {
            const h = clone.getBoundingClientRect().height;
            measuredHeights.set(el, h);
            containerHeightAssigned = true;
          }
        } else if (c.nodeType === Node.ELEMENT_NODE) {
          const innerText = c.textContent || '';
          if (innerText.trim().length > 0) {
            const h = c.getBoundingClientRect().height;
            // map original element node to measured height
            measuredHeights.set(o, h);
          }
        }
      }
      // remove clone
      document.body.removeChild(clone);
    } catch (e) {
      // measurement best-effort; if it fails, proceed without reserved heights
    }

    const targets = gatherTargets(el);
    // Flatten into sequence of characters with pointers to target
    const sequence = [];
    for (const t of targets) {
      for (let i = 0; i < t.chars.length; i++) {
        sequence.push({ node: t.node, ch: t.chars[i] });
      }
      // After each target we add a small pause (represented by a marker)
      sequence.push({ pause: true });
    }

    // Helper to place a temporary invisible marker after a target node for measurements.
    // Returns the marker element (caller should remove it when done).
    function placeMarkerAfter(node) {
      const marker = document.createElement('span');
      marker.style.display = 'inline-block';
      marker.style.width = '0px';
      marker.style.height = '0px';
      marker.style.visibility = 'hidden';
      marker.style.pointerEvents = 'none';
      try {
        if (node && node.nodeType === Node.TEXT_NODE && node.parentNode) {
          node.parentNode.insertBefore(marker, node.nextSibling);
        } else if (node && node.nodeType === Node.ELEMENT_NODE && node.parentNode) {
          node.parentNode.insertBefore(marker, node.nextSibling || null);
        } else {
          el.appendChild(marker);
        }
      } catch (e) { /* swallow */ }
      return marker;
    }

    let idx = 0;
    let prevChar = '';
    function computeDelayForChar(ch) {
      // base with jitter
      const jitter = (Math.random() - 0.5) * speed * 0.6; // +/-30%
      let d = Math.max(20, speed + jitter);
      // spaces are quicker to type
      if (ch === ' ') d = Math.max(10, d * 0.5);
      return Math.round(d);
    }

    function computeExtraPauseAfter(ch) {
      // longer pauses after punctuation
      if (!ch) return 0;
      if (ch === ',') return speed * 6 + Math.random() * speed * 2; // medium pause
      if (/[\.\?\!]/.test(ch)) return speed * 10 + Math.random() * speed * 6; // longer pause
      return 0;
    }

    function step() {
      if (idx >= sequence.length) {
          // finished
          return;
        }

      const item = sequence[idx]; // peek, we'll advance idx when we actually consume

      if (item.pause) {
        idx++;
        // natural pause between typable targets (slightly randomized)
        const pauseDur = Math.max(120, speed * 4 + (Math.random() * speed * 2));
        setTimeout(step, pauseDur);
        prevChar = '';
        return;
      }

      // Determine if this item is the start of a word
      const isStartOfWord = item.ch && item.ch !== ' ' && (prevChar === '' || prevChar === ' ');
      if (isStartOfWord) {
        // collect upcoming word string
        let word = '';
        let look = idx;
        while (look < sequence.length) {
          const s = sequence[look];
          if (s.pause) break;
          if (s.ch === ' ') break;
          word += s.ch || '';
          look++;
        }

        if (word.length > 0) {
          try {
            // Insert a temporary invisible marker to determine where the next
            // character will be placed. Measure remaining space and compare
            // word width. Remove marker after measuring.
            const containerRect = el.getBoundingClientRect();
            const marker = placeMarkerAfter(item.node);

            // measure remaining space to the container's right edge
            const markerRect = marker.getBoundingClientRect();
            const remaining = Math.max(0, containerRect.right - markerRect.right);

            // create a temporary measuring span after the marker to measure the word width
            const meas = document.createElement('span');
            meas.style.whiteSpace = 'nowrap';
            meas.style.visibility = 'hidden';
            meas.style.pointerEvents = 'none';
            meas.textContent = word;
            if (marker.parentNode) marker.parentNode.insertBefore(meas, marker.nextSibling);
            const wordWidth = meas.getBoundingClientRect().width;
            if (meas.parentNode) meas.parentNode.removeChild(meas);
            if (marker.parentNode) marker.parentNode.removeChild(marker);

            if (wordWidth > remaining) {
              // Insert a line break so the word starts on the next line.
              // Avoid inserting <br> between block-level elements (eg. <p>)
              // because block elements already break lines and adding <br>
              // can create extra vertical gaps. Only insert <br> when the
              // current node is a text node or an inline element.
              const br = document.createElement('br');
              try {
                if (item.node.nodeType === Node.TEXT_NODE && item.node.parentNode) {
                  item.node.parentNode.insertBefore(br, item.node.nextSibling);
                } else if (item.node.nodeType === Node.ELEMENT_NODE && item.node.parentNode) {
                  // Check computed display style; only insert for inline contexts
                  let display = 'inline';
                  try {
                    display = window.getComputedStyle(item.node).display || display;
                  } catch (e) { /* ignore */ }
                  if (display === 'inline' || display === 'inline-block' || display === 'inline-flex' || display === 'inline-grid') {
                    item.node.parentNode.insertBefore(br, item.node.nextSibling || null);
                  } else {
                    // block-level element: do nothing (it already forces line breaks)
                  }
                } else {
                  // Fallback: append to container only if container is inline-ish
                  let display = 'block';
                  try { display = window.getComputedStyle(el).display || display; } catch (e) {}
                  if (display === 'inline' || display === 'inline-block' || display === 'inline-flex' || display === 'inline-grid') {
                    el.appendChild(br);
                  }
                }
              } catch (e) { /* swallow */ }
            }
          } catch (e) {
            // measurement best-effort, ignore failures
          }
        }
      }

      // Now consume the item and type it
      idx++;
      // No visible cursor: characters are appended in place without a blinking cursor.
      // append char as a span so we can fade it in
      try {
        const span = document.createElement('span');
        span.className = 'tw-char';
        span.textContent = item.ch;
        // Ensure initial opacity=0 is set (CSS handles this), then trigger to 1
        if (item.node.nodeType === Node.TEXT_NODE) {
          // insert before the placeholder text node so characters appear in place
          if (item.node.parentNode) item.node.parentNode.insertBefore(span, item.node);
        } else if (item.node.nodeType === Node.ELEMENT_NODE) {
          item.node.appendChild(span);
        } else {
          if (el) el.appendChild(span);
        }
        // trigger fade-in on next frame
        requestAnimationFrame(() => {
          try { span.style.opacity = '1'; } catch (e) {}
        });
      } catch (e) { /* swallow */ }

      // compute delay based on the character just typed and previous char
      const baseDelay = computeDelayForChar(item.ch);
      const extraAfter = computeExtraPauseAfter(item.ch);
      // occasional 'thinking' pause but NOT in the middle of a word
      let thinking = 0;
      try {
        if (Math.random() < 0.04) {
          const nextItem = sequence[idx]; // after we've advanced idx, this is the next item
          // Only allow a longer 'thinking' pause when the next item is whitespace
          // or an explicit pause marker (i.e., at a word boundary).
          const nextCh = nextItem && nextItem.ch;
          const nextIsSpace = nextCh === ' ';
          const nextIsPauseMarker = !!(nextItem && nextItem.pause);
          if (nextIsSpace || nextIsPauseMarker) {
            thinking = Math.random() * 400;
          }
        }
      } catch (e) { /* swallow */ }
      const totalDelay = baseDelay + Math.round(extraAfter) + Math.round(thinking);
      prevChar = item.ch;
      setTimeout(step, totalDelay);
    }
    // Apply measured heights as inline styles (min-height) so typing doesn't change layout
    try {
      for (const t of targets) {
        if (!t || !t.node) continue;
        if (t.type === 'text') {
          // text nodes were replaced with placeholders inside the container element (el)
          if (measuredHeights.has(el)) {
            el.style.minHeight = Math.ceil(measuredHeights.get(el)) + 'px';
          }
        } else if (t.type === 'anchor' || t.type === 'element') {
          const h = measuredHeights.get(t.node);
          if (h) {
            try { t.node.style.minHeight = Math.ceil(h) + 'px'; } catch (e) {}
          }
        }
      }
    } catch (e) { /* swallow */ }

    // no initial visible cursor
    setTimeout(step, speed);
  }

  // We'll observe sections instead: when a <section> becomes visible,
  // start typing for every `.typewriter` within that section. This keeps
  // typing scoped per-section and avoids interfering with inflection logic.
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        try {
          const sec = en.target;
          const els = sec.querySelectorAll('.typewriter');
          els.forEach(el => startTypingForElement(el));
        } catch (e) { /* swallow */ }
        sectionObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.25 });

  // Fallback observer for pages without sections: observe individual .typewriter elements
  const fallbackObserver = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        startTypingForElement(en.target);
        fallbackObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.25 });

  function scanAndObserve() {
    // First, observe sections that have at least one .typewriter child
    const sections = Array.from(document.querySelectorAll('section'));
    let found = false;
    sections.forEach(sec => {
      if (sec.querySelector('.typewriter')) {
        found = true;
        // avoid double-observing
        if (!sec.dataset._tw_observed) {
          sec.dataset._tw_observed = '1';
          sectionObserver.observe(sec);
        }
      }
    });
    if (!found) {
      // No sections with .typewriter found -> observe .typewriter elements directly
      const els = document.querySelectorAll('.typewriter');
      els.forEach(el => {
        if (!el.dataset._tw_started) fallbackObserver.observe(el);
      });
    }
  }

  // Observe DOM mutations so dynamically inserted .typewriter elements (via markdown render) are picked up
  const mo = new MutationObserver((muts) => {
    // small debounce
    scanAndObserve();
  });
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });

  // Initial scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndObserve);
  } else {
    scanAndObserve();
  }
})();
