document.addEventListener('DOMContentLoaded', () => {
    // 1. Get all HTML elements waiting for being manipulated
    const originalTextarea = document.getElementById('originalText');
    const dictatedTextarea = document.getElementById('dictatedText');
    const compareButton = document.getElementById('compareBtn');
    const resultDisplay = document.getElementById('resultDisplay');

    // 2. Add event listener for "Compare" button
    compareButton.addEventListener('click', () => {
        const originalText = originalTextarea.value.trim();
        const dictatedText = dictatedTextarea.value.trim();

        // Simple verification, preventing user from submit blank content.
        if (!originalText || !dictatedText) {
            resultDisplay.innerHTML = '<p style="color: red;">Please input original text or your dictation.</p>';
            return;
        }

        // 3. Use jsdiff library to compare texts
        // Diff.diffWords will return a object array with difference informations.
        const diff = Diff.diffWords(originalText, dictatedText);

        // Create a document fragment to build up result efficiently, avoiding manipulate DOM too often.
        const fragment = document.createDocumentFragment();

        // 4. Iterating diff array, creating HTML with highlight tags.
        diff.forEach((part) => {
            const span = document.createElement('span');
            // part.added: extra parts
            // part.removed: miss parts or wrong parts
            if (part.added) {
                span.className = 'error'; // Apply the "error" style defined in css.
                span.textContent = `[→ ${part.value}]`;
            } else if (part.removed) {
                span.className = 'error';
                span.textContent = `[${part.value} →]`;
            } else {
                span.textContent = part.value;
            }
            fragment.appendChild(span);
        });

        // 5. display result
        resultDisplay.innerHTML = ''; // remove previous contents
        resultDisplay.appendChild(fragment);

        // Optimize：Modify from "[A →] [→ B]" to "[A → B]"
        resultDisplay.innerHTML = resultDisplay.innerHTML.replace(
            /<span class="error">\[(.*?)\s→\]<\/span><span class="error">\[→\s(.*?)]<\/span>/g,
            '<span class="error">[$1 → $2]</span>'
        );
    });
});