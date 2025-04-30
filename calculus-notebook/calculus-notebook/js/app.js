document.addEventListener('DOMContentLoaded', function() {
    console.log('AP Calculus BC Notebook initialized');
    
    // Handle solutions toggle for practice problems
    const solutions = document.querySelectorAll('.solution');
    solutions.forEach(solution => {
        // Add a button before each solution
        const button = document.createElement('button');
        button.textContent = 'Show Solution';
        button.className = 'solution-toggle';
        button.setAttribute('aria-expanded', 'false');
        
        // Hide solution initially
        solution.style.display = 'none';
        
        // Insert button before solution
        solution.parentNode.insertBefore(button, solution);
        
        // Add click event to button
        button.addEventListener('click', () => {
            const isHidden = solution.style.display === 'none';
            solution.style.display = isHidden ? 'block' : 'none';
            button.textContent = isHidden ? 'Hide Solution' : 'Show Solution';
            button.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        });
    });
    
    // Add current date highlighting for today's note in the list
    highlightTodaysNote();
    
    // Initialize MathJax if needed
    if (typeof MathJax !== 'undefined') {
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }
    
    // Add navigation buttons in note pages
    addNoteNavigation();
});

/**
 * Highlights the current day's note in the notes list
 */
function highlightTodaysNote() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Find links to today's note
    const noteLinks = document.querySelectorAll('#notes-list li');
    noteLinks.forEach(noteItem => {
        const link = noteItem.querySelector('a');
        if (link && link.getAttribute('href').includes(dateStr)) {
            noteItem.classList.add('today');
        }
    });
}

/**
 * Add previous/next navigation buttons to note pages
 */
function addNoteNavigation() {
    // Only run on note pages
    if (!document.querySelector('.note-content')) return;
    
    // Get current note path
    const currentPath = window.location.pathname;
    const match = currentPath.match(/\/notes\/(\d{4}-\d{2}-\d{2})\.html$/);
    
    if (match) {
        const currentDate = match[1];
        const navSection = document.createElement('div');
        navSection.className = 'note-navigation';
        
        // Calculate prev/next dates
        const date = new Date(currentDate);
        
        // Previous day
        date.setDate(date.getDate() - 1);
        const prevDate = date.toISOString().split('T')[0];
        
        // Reset to current date and get next day
        date.setDate(date.getDate() + 2); // +2 because we went back 1
        const nextDate = date.toISOString().split('T')[0];
        
        // Create navigation
        const prevLink = document.createElement('a');
        prevLink.href = `./${prevDate}.html`;
        prevLink.className = 'prev-note';
        prevLink.innerHTML = '&laquo; Previous Day';
        
        const nextLink = document.createElement('a');
        nextLink.href = `./${nextDate}.html`;
        nextLink.className = 'next-note';
        nextLink.innerHTML = 'Next Day &raquo;';
        
        navSection.appendChild(prevLink);
        navSection.appendChild(nextLink);
        
        // Add to the page
        const noteContent = document.querySelector('.note-content');
        noteContent.appendChild(navSection);
    }
}