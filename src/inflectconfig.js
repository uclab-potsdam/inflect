// with IntersectionObserver we can check what is visible
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let iframe = document.getElementById('if');

            // remove active class from all links
            document.querySelectorAll('a.inflect').forEach(a => {
                a.classList.remove('active');
            });

            // add active class only to the visible link
            let visibleLink = entry.target;
            visibleLink.classList.add('active');

            // update iframe to match visible link
            iframe.src = visibleLink.href;
        }
    });
});

// all inflect links in the document
let inflectLinks = document.querySelectorAll('a.inflect');

// add observer to each inflect link
inflectLinks.forEach(link => {
    observer.observe(link);
    
    // add event listener to deactivate link on click
    link.addEventListener('click', function(event) {
        // prevent the link from navigating
        event.preventDefault();
        let iframe = document.getElementById('if');
        iframe.src = link.href;
        document.querySelectorAll('a.inflect').forEach(a => {
            a.classList.remove('active');
        });
        link.classList.add('active');
    });
});

// scroll up when pressing escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});