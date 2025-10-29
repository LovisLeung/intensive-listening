document.addEventListener('DOMContentLoaded', () => {

    const originalTextSection = document.getElementById('originalTextSection');
    const dictationSection = document.getElementById('dictationSection');
    const resultSection = document.getElementById('resultSection');
    const dictationContainer = document.getElementById('dictationContainer');

    const originalTextarea = document.getElementById('originalText');
    const dictatedTextarea = document.getElementById('dictatedText');

    const submitOriginalBtn = document.getElementById('submitOriginalBtn');
    const compareButton = document.getElementById('compareBtn');
    const showOriginalToggle = document.getElementById('showOriginalToggle');
    const nextPassBtn = document.getElementById('nextPassBtn');
    const editModeToggle = document.getElementById('editModeToggle');

    const resultDisplay = document.getElementById('resultDisplay');

    let storedOriginalText = '';
    let isInNextPassMode = false;


    // core part
    function reconstructTextFromInputs() {
        let reconstructedText = '';
        const dictationDisplay = document.getElementById('dictationDisplay');
        if (!dictationDisplay) return '';

        dictationDisplay.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                reconstructedText += node.textContent;
            } else if (node.tagName === 'INPUT') {
                reconstructedText += node.value.trim() || '_';
            }
        });
        return reconstructedText;
    }


    submitOriginalBtn.addEventListener('click', () => {
        const originalText = originalTextarea.value.trim();
        if (!originalText) {
            alert('Please enter the original text!');
            return;
        }
        storedOriginalText = originalText;
        originalTextSection.classList.add('hidden');
        dictationSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
    });

    // important
    nextPassBtn.addEventListener('click', () => {
        isInNextPassMode = true;

        const currentText = dictatedTextarea.value;

        const dictationDisplay = document.createElement('div');
        dictationDisplay.id = 'dictationDisplay';

        const parts = currentText.split('_');
        parts.forEach((part, index) => {
            dictationDisplay.appendChild(document.createTextNode(part));

            if (index < parts.length - 1) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'placeholder-input';
                dictationDisplay.appendChild(input);
            }
        });

        dictatedTextarea.classList.add('hidden');
        dictationContainer.appendChild(dictationDisplay);

        nextPassBtn.classList.add('hidden');
        editModeToggle.classList.remove('hidden');
    });

    editModeToggle.addEventListener('click', () => {
        isInNextPassMode = false;

        const reconstructedText = reconstructTextFromInputs();
        dictatedTextarea.value = reconstructedText;

        dictationContainer.querySelector('#dictationDisplay').remove();
        dictatedTextarea.classList.remove('hidden');

        nextPassBtn.classList.remove('hidden');
        editModeToggle.classList.add('hidden');
    });

    compareButton.addEventListener('click', () => {
        let dictatedText = '';

        if (isInNextPassMode) {
            dictatedText = reconstructTextFromInputs();
        } else {
            dictatedText = dictatedTextarea.value.trim();
        }

        if (!dictatedText) {
            alert('Please enter your dictated text!');
            return;
        }

        const diff = Diff.diffWords(storedOriginalText, dictatedText);
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < diff.length; i++) {
            const part = diff[i];
            const nextPart = diff[i + 1];

            // manipulate the wrong part
            if (part.removed && nextPart && nextPart.added) {
                const mistake = document.createElement('del');
                mistake.className = 'mistake';
                mistake.textContent = nextPart.value;
                fragment.appendChild(mistake);

                const correct = document.createElement('span');
                correct.className = 'correct';
                correct.textContent = part.value;
                fragment.appendChild(correct);

                i++;
            } else if (part.removed) {
                const omission = document.createElement('span');
                omission.className = 'omission';
                omission.textContent = `(+${part.value.trim()}) `;
                fragment.appendChild(omission);
            } else if (part.added) {
                const addition = document.createElement('del');
                addition.className = 'addition';
                addition.textContent = part.value;
                fragment.appendChild(addition);
            } else {
                fragment.appendChild(document.createTextNode(part.value));
            }
        }

        resultDisplay.innerHTML = '';
        resultDisplay.appendChild(fragment);
        resultSection.classList.remove('hidden');
    });

    showOriginalToggle.addEventListener('click', () => {
        originalTextSection.classList.toggle('hidden');
        if (originalTextSection.classList.contains('hidden')) {
            showOriginalToggle.textContent = 'Show Original Text';
        } else {
            showOriginalToggle.textContent = 'Hide Original Text';
        }
    });
});