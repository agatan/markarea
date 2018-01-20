function calcSelectedLineRange(area) {
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const lastNewlineBeforeStart = area.value.lastIndexOf('\n', start - 1);
    const firstNewlineAfterEnd = area.value.indexOf('\n', end);
    return {
        start: lastNewlineBeforeStart === -1 ? 0 : lastNewlineBeforeStart,
        end: firstNewlineAfterEnd === -1 ? area.value.length : firstNewlineAfterEnd,
    }
}

function replaceSelectedLinesInArea(area, lineMapper) {
    const {
        start,
        end
    } = calcSelectedLineRange(area);
    let content = area.value.substr(0, start+1);
    const replacingContent = area.value.substr(start+1, end - start - 1);
    console.log(replacingContent.split('\n'));
    const replacedContent = replacingContent.split('\n').map(lineMapper).join('\n');
    content += replacedContent;
    content += area.value.substr(end);
    area.value = content;
}

function onRawTabKey(ev) {
    const area = ev.target;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    replaceSelectedLinesInArea(ev.target, (line) => {
        return "  " + line;
    });
    area.selectionStart = start + 2;
    area.selectionEnd = end + 2;
}

function onShiftTabKey(ev) {
    const area = ev.target;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    let startOffset = null;
    let endOffset = null;
    replaceSelectedLinesInArea(area, (line) => {
        const nonSpaceHead = line.search(/\S/);
        if (nonSpaceHead > 2) {
            endOffset = 2;
            startOffset = startOffset || 2;
            return line.substr(2);
        }
        if (nonSpaceHead === -1) {
            const offset = line.length > 2 ? 2 : line.length;
            endOffset = offset;
            startOffset = startOffset || offset;
            return line.substr(2);
        }
        endOffset = nonSpaceHead;
        startOffset = startOffset || nonSpaceHead;
        return line.trimLeft();
    })
    area.selectionStart = start - startOffset;
    area.selectionEnd = end - endOffset;
}

function onTabKey(ev) {
    ev.preventDefault();
    if (!ev.shiftKey) {
        onRawTabKey(ev);
    } else {
        onShiftTabKey(ev);
    }
}

function setCallbacks(area) {
    area.addEventListener('keydown', (ev) => {
        switch (ev.keyCode) {
            case 9:
                onTabKey(ev);
        }
        return;
    });
}

function main() {
    let textareas = document.getElementsByTagName('textarea');
    if (!textareas) {
        return;
    }

    for (textarea of textareas) {
        setCallbacks(textarea);
    }
}

main()