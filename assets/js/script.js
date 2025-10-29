// Wait for the entire HTML document to be loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Get all necessary DOM elements ---
    // Sections
    const originalTextSection = document.getElementById('originalTextSection');
    const dictationSection = document.getElementById('dictationSection');
    const resultSection = document.getElementById('resultSection');

    // Textareas
    const originalTextarea = document.getElementById('originalText');
    const dictatedTextarea = document.getElementById('dictatedText');

    // Buttons and Toggles
    const submitOriginalBtn = document.getElementById('submitOriginalBtn');
    const compareButton = document.getElementById('compareBtn');
    const showOriginalToggle = document.getElementById('showOriginalToggle');

    // Result Display
    const resultDisplay = document.getElementById('resultDisplay');

    // --- 2. State Management ---
    // This variable will store the original text after the user submits it
    let storedOriginalText = '';

    // --- 3. Event Listeners ---

    // Listen for clicks on the "Submit Original" button
    submitOriginalBtn.addEventListener('click', () => {
        const originalText = originalTextarea.value.trim();
        if (!originalText) {
            alert('Please enter the original text!');
            return;
        }

        // Store the text in our variable
        storedOriginalText = originalText;

        // Switch the UI: hide the original section, show the dictation section
        originalTextSection.classList.add('hidden');
        dictationSection.classList.remove('hidden');

        // Ensure the result section is hidden if the user is starting a new comparison
        resultSection.classList.add('hidden');
    });

    // Listen for clicks on the "Show/Hide Original Text" link
    showOriginalToggle.addEventListener('click', () => {
        // The 'toggle' method adds the class if it's not there, and removes it if it is.
        originalTextSection.classList.toggle('hidden');

        // Improve user experience by changing the link text based on the state
        if (originalTextSection.classList.contains('hidden')) {
            showOriginalToggle.textContent = 'Show Original Text';
        } else {
            showOriginalToggle.textContent = 'Hide Original Text';
        }
    });

    // Listen for clicks on the "Compare Texts" button
    compareButton.addEventListener('click', () => {
        const dictatedText = dictatedTextarea.value.trim();

        if (!dictatedText) {
            alert('Please enter your dictated text!');
            return;
        }

        // Use the stored original text for comparison
        const diff = Diff.diffWords(storedOriginalText, dictatedText);

        const fragment = document.createDocumentFragment();
        diff.forEach((part) => {
            const span = document.createElement('span');
            if (part.added) {
                span.className = 'error';
                span.textContent = `[→ ${part.value}]`;
            } else if (part.removed) {
                span.className = 'error';
                span.textContent = `[${part.value} →]`;
            } else {
                span.textContent = part.value;
            }
            fragment.appendChild(span);
        });

        // Display the results on the page
        resultDisplay.innerHTML = ''; // Clear previous results
        resultDisplay.appendChild(fragment);

        // Optimization: Combine adjacent removal/addition into a single "replacement" for better readability
        // e.g., "[wordA →] [→ wordB]" becomes "[wordA → wordB]"
        resultDisplay.innerHTML = resultDisplay.innerHTML.replace(
            /<span class="error">\[(.*?)\s→\]<\/span><span class="error">\[→\s(.*?)]<\/span>/g,
            '<span class="error">[$1 → $2]</span>'
        );

        // Show the result section
        resultSection.classList.remove('hidden');
    });
});