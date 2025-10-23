// External typewriter module
// Starts typing only for elements with the .typewriter class after they enter view
// and preserves anchors by typing into anchor.textContent without touching hrefs.
(function(){
  if (typeof window === 'undefined' || !document) return;

  // Inject simple block-cursor CSS for movable cursor element
  const style = document.createElement('style');
  style.id = 'typewriter-external-style';
  style.textContent = `
.tw-cursor {
  display: inline-block;
  width: 0.6ch; /* approximate character width */
  height: 1em;
  vertical-align: -0.12em; /* nudge to baseline */
  margin-left: 0;
  background: currentColor;
  opacity: 1;
  animation: typewriter-blink 1s steps(1) infinite;
}
@keyframes typewriter-blink { 50% { opacity: 0; } }
`;
  // Add character fade-in class
  style.textContent += `
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
    // Create a movable cursor element and attach when typing begins
    const cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursor.setAttribute('aria-hidden', 'true');
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

    // Helper to place cursor after a target node
    function placeCursorAfter(node) {
      try {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.parentNode) node.parentNode.insertBefore(cursor, node.nextSibling);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.appendChild(cursor);
        } else {
          // fallback: append to element container
          el.appendChild(cursor);
        }
      } catch (e) { /* swallow */ }
    }

    let idx = 0;
    let prevChar = '';
    function computeDelayForChar(ch) {
      // base with jitter
      const jitter = (Math.random() - 0.5) * speed * 0.6; // +/-30%
      let d = Math.max(20, speed + jitter);
      // spaces are quicker to type
      if (ch === ' ') d = Math.max(10, d * 0.5);
      // small natural pause probability (thinking)
      if (Math.random() < 0.04) d += Math.random() * 400; // occasional longer pause
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
        try { if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor); } catch (e) {}
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
            // place cursor so measurements reflect the current inline position
            placeCursorAfter(item.node);
            const containerRect = el.getBoundingClientRect();
            const cursorRect = cursor.getBoundingClientRect();
            const remaining = Math.max(0, containerRect.right - cursorRect.right);

            // create a temporary measuring span next to the cursor to measure the word width
            const meas = document.createElement('span');
            meas.style.whiteSpace = 'nowrap';
            meas.style.visibility = 'hidden';
            meas.style.pointerEvents = 'none';
            meas.textContent = word;
            if (cursor.parentNode) cursor.parentNode.insertBefore(meas, cursor.nextSibling);
            const wordWidth = meas.getBoundingClientRect().width;
            if (meas.parentNode) meas.parentNode.removeChild(meas);

            if (wordWidth > remaining) {
              // Insert a line break before the cursor so the word starts on the next line
              const br = document.createElement('br');
              try {
                if (item.node.nodeType === Node.TEXT_NODE && item.node.parentNode) {
                  item.node.parentNode.insertBefore(br, cursor);
                } else if (item.node.nodeType === Node.ELEMENT_NODE && item.node.parentNode) {
                  item.node.parentNode.insertBefore(br, item.node.nextSibling || cursor);
                } else {
                  el.appendChild(br);
                }
              } catch (e) { /* swallow */ }
              // after inserting br, the cursor will move appropriately on next placeCursorAfter
            }
          } catch (e) {
            // measurement best-effort, ignore failures
          }
        }
      }

      // Now consume the item and type it
      idx++;
      // move cursor to just after the current node so it marks the insertion point
      placeCursorAfter(item.node);
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
      const totalDelay = baseDelay + Math.round(extraAfter);
      prevChar = item.ch;
      setTimeout(step, totalDelay);
    }
    // Insert initial cursor before typing starts so user sees position immediately
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

    if (sequence.length > 0) placeCursorAfter(sequence[0].node);
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
