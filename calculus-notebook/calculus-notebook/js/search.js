// This file implements the search functionality for the calculus notebook web app.
// It allows users to search for key terms across the notes.

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput && searchButton) {
        // Add event listeners for search
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        
        searchButton.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
    }
    
    // Check if URL contains search parameter
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    if (searchQuery) {
        if (searchInput) searchInput.value = searchQuery;
        performSearch(searchQuery);
    }
});

/**
 * Performs a search across all notebook content
 * @param {string} query - The search query
 */
async function performSearch(query) {
    if (!query || query.trim() === '') return;
    
    // Prepare search query
    query = query.trim().toLowerCase();
    
    // Redirect to index with search query if we're on a note page
    if (!document.getElementById('notes-list')) {
        window.location.href = '../index.html?q=' + encodeURIComponent(query);
        return;
    }
    
    // Get list of all notes
    const noteLinks = Array.from(document.querySelectorAll('#notes-list a'));
    const searchResults = [];
    
    // Show loading indicator
    const notesContainer = document.getElementById('notes-container');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.textContent = 'Searching...';
    
    // Remove previous results
    const oldResults = document.querySelector('.search-results');
    if (oldResults) {
        oldResults.remove();
    }
    
    notesContainer.appendChild(loadingIndicator);
    
    try {
        // Fetch content of each note and search within it
        for (const link of noteLinks) {
            const noteUrl = link.getAttribute('href');
            try {
                const response = await fetch(noteUrl);
                if (!response.ok) continue;
                
                const html = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                
                // Extract text content from main content area
                const noteContent = tempDiv.querySelector('.note-content');
                if (!noteContent) continue;
                
                const textContent = noteContent.textContent.toLowerCase();
                
                // Check if query appears in content
                if (textContent.includes(query)) {
                    // Extract note title and headings for context
                    const title = tempDiv.querySelector('title')?.textContent || link.textContent;
                    let headings = [];
                    tempDiv.querySelectorAll('.note-content h3').forEach(heading => {
                        const headingText = heading.textContent.toLowerCase();
                        if (headingText.includes(query)) {
                            headings.push(heading.textContent);
                        }
                    });
                    
                    // Extract a snippet of text around the query
                    const snippets = extractSnippets(textContent, query);
                    
                    // Add to search results
                    searchResults.push({
                        url: noteUrl,
                        title: title,
                        date: link.textContent.split(' - ')[0],
                        headings: headings,
                        snippets: snippets
                    });
                }
            } catch (err) {
                console.error(`Error searching in ${noteUrl}:`, err);
            }
        }
        
        // Remove loading indicator
        notesContainer.removeChild(loadingIndicator);
        
        // Display search results
        displaySearchResults(query, searchResults);
    } catch (err) {
        console.error('Search error:', err);
        notesContainer.removeChild(loadingIndicator);
        
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error';
        errorMsg.textContent = 'An error occurred during search. Please try again.';
        notesContainer.appendChild(errorMsg);
    }
}

/**
 * Extract text snippets containing the search query
 * @param {string} text - The full text content
 * @param {string} query - The search query
 * @returns {string[]} - Array of snippets
 */
function extractSnippets(text, query) {
    const maxSnippets = 3;
    const snippetLength = 100; // characters on each side of the match
    const snippets = [];
    
    let startPos = 0;
    while (snippets.length < maxSnippets) {
        const pos = text.indexOf(query, startPos);
        if (pos === -1) break;
        
        const snippetStart = Math.max(0, pos - snippetLength);
        const snippetEnd = Math.min(text.length, pos + query.length + snippetLength);
        let snippet = text.substring(snippetStart, snippetEnd);
        
        // Add ellipsis if we're not at the beginning or end
        if (snippetStart > 0) snippet = '...' + snippet;
        if (snippetEnd < text.length) snippet = snippet + '...';
        
        snippets.push(snippet);
        startPos = pos + query.length;
    }
    
    return snippets;
}

/**
 * Displays the search results on the page
 * @param {string} query - The search query
 * @param {Array} results - The search results
 */
function displaySearchResults(query, results) {
    const notesContainer = document.getElementById('notes-container');
    
    // Create results section
    const resultsSection = document.createElement('div');
    resultsSection.className = 'search-results';
    
    // Add search info
    const searchInfo = document.createElement('h2');
    searchInfo.textContent = `Search Results for "${query}"`;
    resultsSection.appendChild(searchInfo);
    
    const resultCount = document.createElement('p');
    resultCount.textContent = `Found ${results.length} matching notes`;
    resultsSection.appendChild(resultCount);
    
    if (results.length === 0) {
        const noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No matching notes found. Try different keywords.';
        resultsSection.appendChild(noResults);
    } else {
        // Create results list
        const resultsList = document.createElement('ul');
        resultsList.className = 'search-results-list';
        
        results.forEach(result => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = result.url;
            link.textContent = result.title;
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'result-date';
            dateSpan.textContent = result.date;
            
            listItem.appendChild(link);
            listItem.appendChild(dateSpan);
            
            // Add matching headings if any
            if (result.headings.length > 0) {
                const headingsDiv = document.createElement('div');
                headingsDiv.className = 'matching-headings';
                const headingsList = document.createElement('ul');
                
                result.headings.forEach(heading => {
                    const headingItem = document.createElement('li');
                    headingItem.textContent = heading;
                    headingsList.appendChild(headingItem);
                });
                
                headingsDiv.appendChild(headingsList);
                listItem.appendChild(headingsDiv);
            }
            
            // Add snippets for context
            if (result.snippets.length > 0) {
                const snippetsDiv = document.createElement('div');
                snippetsDiv.className = 'result-snippets';
                
                result.snippets.forEach((snippet, i) => {
                    if (i > 0) {
                        const separator = document.createElement('hr');
                        snippetsDiv.appendChild(separator);
                    }
                    
                    const snippetP = document.createElement('p');
                    // Highlight the query term
                    const highlighted = snippet.replace(
                        new RegExp(query, 'gi'),
                        match => `<mark>${match}</mark>`
                    );
                    snippetP.innerHTML = highlighted;
                    snippetsDiv.appendChild(snippetP);
                });
                
                listItem.appendChild(snippetsDiv);
            }
            
            resultsList.appendChild(listItem);
        });
        
        resultsSection.appendChild(resultsList);
    }
    
    // Show options to clear search
    const clearSearch = document.createElement('button');
    clearSearch.textContent = 'Clear Search';
    clearSearch.className = 'clear-search';
    clearSearch.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    resultsSection.appendChild(clearSearch);
    
    // Add results to page
    notesContainer.appendChild(resultsSection);
    
    // Update URL with search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);
}