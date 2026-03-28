import { chunkTextBySentenceCount } from './contentChunker';

const NOISE_SELECTORS = [
    'nav',
    'header',
    'footer',
    'aside',
    'script',
    'style',
    'noscript',
    '[data-no-read="true"]',
    '.skip-reading',
    '.voice-assistant-panel',
    '.slick-arrow',
    '.slick-dots',
].join(',');

const removeNoise = (root) => {
    const clonedRoot = root.cloneNode(true);
    clonedRoot.querySelectorAll(NOISE_SELECTORS).forEach((node) => node.remove());
    return clonedRoot;
};

const normalizeText = (text) => {
    return (text || '').replace(/\s+/g, ' ').trim();
};

const BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, blockquote';

const pauseForTag = (tagName) => {
    if (!tagName) {
        return 650;
    }

    if (tagName.startsWith('H')) {
        return 900;
    }

    if (tagName === 'LI') {
        return 500;
    }

    return 700;
};

const buildChunksFromNode = (node) => {
    const blockNodes = Array.from(node.querySelectorAll(BLOCK_SELECTOR));

    const semanticChunks = blockNodes
        .map((blockNode) => {
            const text = normalizeText(blockNode.textContent);
            if (!text) {
                return null;
            }

            return {
                text,
                pauseAfterMs: pauseForTag(blockNode.tagName),
            };
        })
        .filter(Boolean);

    if (semanticChunks.length > 0) {
        return semanticChunks;
    }

    const fallbackText = normalizeText(node.textContent);
    return chunkTextBySentenceCount(fallbackText, 4).map((text) => ({
        text,
        pauseAfterMs: 650,
    }));
};

export const getReadableSections = () => {
    const sourceRoot = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    const contentRoot = removeNoise(sourceRoot);

    const sectionNodes = Array.from(contentRoot.querySelectorAll('section, article'));

    const sections = sectionNodes
        .map((node, index) => {
            const headingNode = node.querySelector('h1, h2, h3, h4, h5, h6');
            const heading = normalizeText(headingNode?.textContent) || `Section ${index + 1}`;
            const chunks = buildChunksFromNode(node);
            return {
                id: `section-${index + 1}`,
                heading,
                chunks,
            };
        })
        .filter((section) => section.chunks.length > 0);

    if (sections.length > 0) {
        return sections;
    }

    const fallbackText = normalizeText(contentRoot.textContent);
    if (!fallbackText) {
        return [];
    }

    return [
        {
            id: 'section-1',
            heading: 'Main content',
            chunks: chunkTextBySentenceCount(fallbackText, 4).map((text) => ({
                text,
                pauseAfterMs: 650,
            })),
        },
    ];
};
