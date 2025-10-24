document.addEventListener('DOMContentLoaded', function () {
  // Helper: find headings that mark chapters
  function findHeadings() {
    const headingSet = new Set();
    document.querySelectorAll('.subheader').forEach(container => {
      // descendant headings
      container.querySelectorAll('h1, h2, h3').forEach(h => headingSet.add(h));
      // heading immediately after the .subheader element
      const next = container.nextElementSibling;
      if (next && /H[1-3]/.test(next.tagName)) headingSet.add(next);
    });

    // Also include headings that explicitly have class `subheader` (e.g. ## Title {.subheader})
    document.querySelectorAll('h1.subheader, h2.subheader, h3.subheader').forEach(h => headingSet.add(h));

    let headings = Array.from(headingSet).filter(el => el.offsetParent !== null);
    // Sort headings in document order (top to bottom)
    headings.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    return headings;
  }

  // slugify helper
  function slugify(s) {
    return s.toString().toLowerCase().trim()
      .replace(/[^a-z0-9\-\s\u0600-\u06FF]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\-+/g, '-');
  }

  // Remove existing nav if present
  function clearNav() {
    const existing = document.getElementById('chapter-nav');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }

  // Build navigation from headings array
  function buildNav(headings) {
    if (!headings || !headings.length) return;
    
    // Ensure chapter headings have ids
    headings.forEach((h, idx) => {
      if (!h.id || h.id.trim() === '') {
        const base = slugify(h.textContent || ('chapter-' + (idx+1)));
        let id = base;
        let i = 1;
        while (document.getElementById(id)) { id = base + '-' + (i++); }
        h.id = id;
      }
    });

    // Find all sections in the document
    const allSections = Array.from(document.querySelectorAll('main section')).filter(s => s.offsetParent !== null);
    
    // Ensure all sections have ids
    allSections.forEach((s, idx) => {
      if (!s.id || s.id.trim() === '') {
        s.id = 'section-' + idx;
      }
    });

    // Map sections to their parent chapters
    const sectionToChapter = new Map();
    allSections.forEach(section => {
      // Find which chapter heading this section belongs to
      let chapterHeading = null;
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const headingPos = heading.getBoundingClientRect().top + window.pageYOffset;
        const sectionPos = section.getBoundingClientRect().top + window.pageYOffset;
        if (headingPos <= sectionPos) {
          chapterHeading = heading;
          break;
        }
      }
      if (chapterHeading) {
        sectionToChapter.set(section.id, chapterHeading.id);
      }
    });

    clearNav();
    const nav = document.createElement('nav');
    nav.id = 'chapter-nav';
    nav.setAttribute('aria-label', 'Chapters and Sections');

    // Build chapter items with their sections
    headings.forEach((h, chapterIdx) => {
      const chapterTitle = h.textContent.trim();
      
      // Create chapter heading button
      const chapterItem = document.createElement('div');
      chapterItem.className = 'chapter-item chapter-heading-item';
      chapterItem.dataset.chapterId = h.id;

      const chapterBtn = document.createElement('button');
      chapterBtn.className = 'chapter-dot chapter-heading-dot';
      chapterBtn.type = 'button';
      chapterBtn.setAttribute('aria-label', chapterTitle);
      chapterBtn.dataset.target = h.id;
      chapterBtn.dataset.type = 'chapter';

      const label = document.createElement('span');
      label.className = 'chapter-label';
      label.textContent = chapterTitle;

      chapterBtn.addEventListener('click', createScrollHandler(h.id));

      chapterItem.appendChild(chapterBtn);
      chapterItem.appendChild(label);
      nav.appendChild(chapterItem);

      // Find and add sections for this chapter
      const chapterSections = allSections.filter(s => sectionToChapter.get(s.id) === h.id);
      chapterSections.forEach(section => {
        const sectionItem = document.createElement('div');
        sectionItem.className = 'chapter-item section-item';
        sectionItem.dataset.chapterId = h.id;

        const sectionBtn = document.createElement('button');
        sectionBtn.className = 'chapter-dot section-dot';
        sectionBtn.type = 'button';
        sectionBtn.setAttribute('aria-label', chapterTitle);
        sectionBtn.dataset.target = section.id;
        sectionBtn.dataset.type = 'section';
        
        // Add tooltip label for sections showing the chapter name
        const sectionLabel = document.createElement('span');
        sectionLabel.className = 'chapter-label';
        sectionLabel.textContent = chapterTitle;

        sectionBtn.addEventListener('click', createScrollHandler(section.id));

        sectionItem.appendChild(sectionBtn);
        sectionItem.appendChild(sectionLabel);
        nav.appendChild(sectionItem);
      });
    });

    document.body.appendChild(nav);

    // Helper function to create scroll handler
    function createScrollHandler(targetId) {
      return function(ev) {
        ev.preventDefault();
        const target = document.getElementById(targetId);
        if (!target) return;
        
        // Suppress the page "snap" behavior during programmatic scroll
        window.__snapSuppressUntil = Date.now() + 1500;
        
        // Mark that we're in a programmatic scroll animation
        window.__chaptersAnimating = true;
        
        // Use custom smooth scroll to center the target
        const scroller = document.querySelector('main') || document.scrollingElement || document.documentElement;
        const viewportHeight = scroller.clientHeight || window.innerHeight;
        const targetTop = target.getBoundingClientRect().top + (scroller.scrollTop || window.pageYOffset);
        const centeredTop = targetTop - (viewportHeight / 2) + (target.offsetHeight / 2);
        
        if (scroller === document.scrollingElement || scroller === document.documentElement) {
          window.scrollTo({ top: centeredTop, behavior: 'smooth' });
        } else {
          scroller.scrollTo({ top: centeredTop, behavior: 'smooth' });
        }
        
        // Clear animation flag after scroll completes (smooth scroll takes ~500-800ms)
        setTimeout(() => {
          window.__chaptersAnimating = false;
        }, 1000);
      };
    }

    // Helper to update progress bar states (visited/future/current)
    function updateProgressStates(currentScrollTop) {
      const viewportHeight = window.innerHeight;
      const viewportCenter = currentScrollTop + (viewportHeight / 2);
      
      // Get all nav items and dots
      const allItems = Array.from(document.querySelectorAll('#chapter-nav .chapter-item'));
      const allDots = Array.from(document.querySelectorAll('#chapter-nav .chapter-dot'));
      
      if (!allDots.length) return; // No dots to update
      
      // Build fresh position data for all targets
      const targetPositions = [];
      allDots.forEach(dot => {
        const targetId = dot.dataset.target;
        const target = document.getElementById(targetId);
        if (!target) return;
        
        const rect = target.getBoundingClientRect();
        const targetTop = rect.top + currentScrollTop;
        
        targetPositions.push({
          dot: dot,
          targetId: targetId,
          top: targetTop,
          distFromCenter: Math.abs(targetTop - viewportCenter)
        });
      });
      
      // Find which section is closest to viewport center (the "current" one)
      let currentTargetId = null;
      let minDist = Infinity;
      
      targetPositions.forEach(pos => {
        if (pos.distFromCenter < minDist) {
          minDist = pos.distFromCenter;
          currentTargetId = pos.targetId;
        }
      });
      
      // Mark all dots as visited, future, or current based on scroll position
      targetPositions.forEach(pos => {
        const dot = pos.dot;
        
        // Remove all state classes first
        dot.classList.remove('visited', 'future', 'current');
        
        // Mark the closest one as current
        if (pos.targetId === currentTargetId) {
          dot.classList.add('current', 'visited');
        }
        // If target is above or at viewport center, it's visited (full opacity)
        // If target is below viewport center, it's future (50% opacity)
        else if (pos.top <= viewportCenter) {
          dot.classList.add('visited');
        } else {
          dot.classList.add('future');
        }
      });
      
      // All items are always visible (no hiding sections anymore)
      allItems.forEach(item => {
        item.style.display = '';
      });
    }

    // Setup active-state tracking with improved state management
    let updateScheduled = false;
    let animationFrameId = null;
    
    function scheduleUpdate() {
      if (updateScheduled) return;
      updateScheduled = true;
      requestAnimationFrame(() => {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        updateProgressStates(currentScrollTop);
        updateScheduled = false;
        
        // If we're in a scroll animation, schedule another update for smooth state transitions
        if (window.__chaptersAnimating) {
          scheduleUpdate();
        }
      });
    }
    
    // Continuous update loop during animations for smooth state changes
    function startAnimationLoop() {
      if (animationFrameId) return; // Already running
      
      function loop() {
        if (window.__chaptersAnimating) {
          const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
          updateProgressStates(currentScrollTop);
          animationFrameId = requestAnimationFrame(loop);
        } else {
          animationFrameId = null;
        }
      }
      
      loop();
    }
    
    // Watch for animation flag changes
    let lastAnimatingState = false;
    setInterval(() => {
      if (window.__chaptersAnimating && !lastAnimatingState) {
        startAnimationLoop();
      }
      lastAnimatingState = window.__chaptersAnimating;
    }, 16); // Check every frame (~60fps)

    // Update on scroll
    document.removeEventListener('scroll', window.__chaptersOnScrollListener);
    window.__chaptersOnScrollListener = scheduleUpdate;
    document.addEventListener('scroll', scheduleUpdate, { passive: true });
    
    // Update on resize (layout may have changed)
    const resizeHandler = () => {
      scheduleUpdate();
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
    
    // Update when page content loads or changes (images, iframes, etc.)
    window.addEventListener('load', scheduleUpdate, { passive: true });
    
    // Update periodically for dynamic content that may shift layout
    const intervalId = setInterval(scheduleUpdate, 2000);
    
    // Store cleanup function
    window.__chaptersCleanup = () => {
      document.removeEventListener('scroll', window.__chaptersOnScrollListener);
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('load', scheduleUpdate);
      clearInterval(intervalId);
    };
    
    // Initial update
    scheduleUpdate();
  }

  // Attempt initial build; if no headings exist yet (due to markdown injection),
  // observe `main` and rebuild when content changes.
  function attemptBuild() {
    const headings = findHeadings();
    if (headings.length) {
      buildNav(headings);
      return true;
    }
    return false;
  }

  // Try immediately
  if (attemptBuild()) return;

  // Watch for changes in <main> and rebuild when headings appear or content changes.
  const main = document.querySelector('main');
  if (!main) return;
  const mo = new MutationObserver((mutations) => {
    // small debounce: batch multiple mutations
    if (window.__chaptersMoTimer) clearTimeout(window.__chaptersMoTimer);
    window.__chaptersMoTimer = setTimeout(() => {
      const built = attemptBuild();
      if (built) {
        try { mo.disconnect(); } catch(e){}
      } else {
        // If nav exists but content changed, rebuild to stay in sync
        const existing = document.getElementById('chapter-nav');
        if (existing) {
          const headings = findHeadings();
          buildNav(headings);
        }
      }
    }, 120);
  });
  mo.observe(main, { childList: true, subtree: true });
});
