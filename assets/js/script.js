document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 获取所有需要操作的 DOM 元素 ---
    // 区域
    const originalTextSection = document.getElementById('originalTextSection');
    const dictationSection = document.getElementById('dictationSection');
    const resultSection = document.getElementById('resultSection');
    const dictationContainer = document.getElementById('dictationContainer'); // 新增：听写区的容器

    // 输入框
    const originalTextarea = document.getElementById('originalText');
    const dictatedTextarea = document.getElementById('dictatedText');

    // 按钮和触发器
    const submitOriginalBtn = document.getElementById('submitOriginalBtn');
    const compareButton = document.getElementById('compareBtn');
    const showOriginalToggle = document.getElementById('showOriginalToggle');
    const nextPassBtn = document.getElementById('nextPassBtn'); // 新增：下一轮按钮
    const editModeToggle = document.getElementById('editModeToggle'); // 新增：切换编辑模式链接

    // 结果显示区
    const resultDisplay = document.getElementById('resultDisplay');

    // --- 2. 状态管理 ---
    let storedOriginalText = '';
    // 新增：追踪当前是否处于“下一轮听写”模式
    let isInNextPassMode = false;

    // --- 3. 核心功能函数 ---

    // 新增：一个函数，用于从“填空模式”的视图中重建完整的文本
    function reconstructTextFromInputs() {
        let reconstructedText = '';
        const dictationDisplay = document.getElementById('dictationDisplay');
        if (!dictationDisplay) return '';

        // 遍历所有子节点（包括文本和输入框）
        dictationDisplay.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) { // 如果是纯文本节点
                reconstructedText += node.textContent;
            } else if (node.tagName === 'INPUT') { // 如果是输入框
                // 如果用户输入了内容，就用它；否则，恢复为占位符
                reconstructedText += node.value.trim() || '_';
            }
        });
        return reconstructedText;
    }

    // --- 4. 事件监听器 ---

    // 提交原文按钮 (逻辑不变)
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

    // “下一轮听写”按钮 - 这是本次的核心功能
    nextPassBtn.addEventListener('click', () => {
        isInNextPassMode = true; // 进入“下一轮”状态

        const currentText = dictatedTextarea.value;

        // 创建一个新的 div 来显示带输入框的文本
        const dictationDisplay = document.createElement('div');
        dictationDisplay.id = 'dictationDisplay'; // 使用 ID 方便之后查找

        // 将文本按占位符 '___' 分割成数组
        const parts = currentText.split('_');
        parts.forEach((part, index) => {
            // 添加文本部分
            dictationDisplay.appendChild(document.createTextNode(part));

            // 在每个部分后面（除了最后一个）添加一个输入框
            if (index < parts.length - 1) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'placeholder-input'; // 应用我们之前写的 CSS 样式
                dictationDisplay.appendChild(input);
            }
        });

        // 切换 UI：隐藏 textarea，显示我们新创建的 div
        dictatedTextarea.classList.add('hidden');
        dictationContainer.appendChild(dictationDisplay);

        // 切换按钮和链接的可见性
        nextPassBtn.classList.add('hidden');
        editModeToggle.classList.remove('hidden');
    });

    // “切换编辑模式”链接
    editModeToggle.addEventListener('click', () => {
        isInNextPassMode = false; // 退出“下一轮”状态

        const reconstructedText = reconstructTextFromInputs();
        dictatedTextarea.value = reconstructedText; // 将重建的文本放回 textarea

        // 切换 UI：移除带输入框的 div，显示回 textarea
        dictationContainer.querySelector('#dictationDisplay').remove();
        dictatedTextarea.classList.remove('hidden');

        // 切换按钮和链接的可见性
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

            if (part.removed && nextPart && nextPart.added) {
                // 这是“替换”的情况 (错误词 -> 正确词)
                const mistake = document.createElement('del');
                mistake.className = 'mistake';
                mistake.textContent = nextPart.value;
                fragment.appendChild(mistake);

                const correct = document.createElement('span');
                correct.className = 'correct';
                correct.textContent = part.value;
                fragment.appendChild(correct);

                i++; // 跳过下一个 part，因为它已经被处理了
            } else if (part.removed) {
                // 这是“漏写”的情况
                const omission = document.createElement('span');
                omission.className = 'omission';
                omission.textContent = `(+${part.value.trim()}) `; // 用 (+单词) 的形式表示漏写
                fragment.appendChild(omission);
            } else if (part.added) {
                // 这是“多写”的情况
                const addition = document.createElement('del');
                addition.className = 'addition';
                addition.textContent = part.value;
                fragment.appendChild(addition);
            } else {
                // 相同的部分
                fragment.appendChild(document.createTextNode(part.value));
            }
        }

        resultDisplay.innerHTML = '';
        resultDisplay.appendChild(fragment);
        resultSection.classList.remove('hidden');
    });

    // “显示/隐藏原文”链接 (逻辑不变)
    showOriginalToggle.addEventListener('click', () => {
        originalTextSection.classList.toggle('hidden');
        if (originalTextSection.classList.contains('hidden')) {
            showOriginalToggle.textContent = 'Show Original Text';
        } else {
            showOriginalToggle.textContent = 'Hide Original Text';
        }
    });
});