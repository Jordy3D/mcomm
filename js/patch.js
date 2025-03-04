/*
█▀▀ █▀█ █▄ █ █▀ ▀█▀ ▄▀█ █▄ █ ▀█▀ █▀
█▄▄ █▄█ █ ▀█ ▄█  █  █▀█ █ ▀█  █  ▄█
*/

/*#region Constants */

const GAME_VERSIONS = {
    'SLUS-20772': {
        baseAddress: '004807D8',
        name: 'SSX 3 Online Server Address',
        authors: ['GlitcherOG(Archy)']
    },
    'SLES-51697-1': {
        baseAddress: '00480148',
        name: 'SSX 3 PAL Online Server Address',
        authors: ['GlitcherOG(Archy)', 'Sly']
    },
    'SLES-51697-2': {
        baseAddress: '004801E8',
        name: 'SSX 3 PAL Online Server Address',
        authors: ['GlitcherOG(Archy)']
    }
};

/*#endregion*/

/*
█▀█ ▄▀█ ▀█▀ █▀▀ █ █   █▀▀ █▀▀ █▄ █ █▀▀ █▀█ ▄▀█ ▀█▀ █ █▀█ █▄ █
█▀▀ █▀█  █  █▄▄ █▀█   █▄█ ██▄ █ ▀█ ██▄ █▀▄ █▀█  █  █ █▄█ █ ▀█
*/

/*#region Patch Generation */
function stringToHex(str) {
    const chunks = [];
    for(let i = 0; i < str.length; i += 4) {
        const chunk = str.slice(i, i + 4).padEnd(4, '\0');
        let hex = '';
        for(let j = 3; j >= 0; j--) {
            hex += chunk.charCodeAt(j).toString(16).padStart(2, '0').toUpperCase();
        }
        chunks.push(hex);
    }
    return chunks;
}

function generatePatch(versionInfo, hexChunks) {
    let patch = `[${versionInfo.name}]\n`;
    patch += `author=${versionInfo.authors.join('/')}\n`;
    
    for(let i = 0; i < hexChunks.length; i++) {
        const address = (parseInt(versionInfo.baseAddress, 16) + (i * 4))
            .toString(16).padStart(8, '0').toUpperCase();
        patch += `patch=0,EE,${address},word,${hexChunks[i]}\n`;
    }
    
    return patch;
}

function isValidAddress(address) {
    return /^[\w.-]+$/.test(address) && address.length > 0 && address.length <= 15;
}

function updatePatch() {
    const version = document.getElementById('gameVersion').value;
    const address = document.getElementById('serverAddress').value.trim();
    const patchCode = document.getElementById('patchCode');
    const copyBtn = document.getElementById('copyButton');
    const downloadBtn = document.getElementById('downloadButton');
    
    // Disable buttons by default
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    
    if (!address) {
        patchCode.textContent = 'Enter a server address to generate patch...';
        return;
    }
    
    if (!isValidAddress(address)) {
        patchCode.textContent = 'Invalid server address. Use only letters, numbers, dots, and hyphens.';
        return;
    }
    
    const versionInfo = GAME_VERSIONS[version];
    const addressHex = stringToHex(address.padEnd(15, '\0'));
    const patch = generatePatch(versionInfo, addressHex);
    patchCode.textContent = patch;
    
    // Enable buttons only if we have valid patch content
    console.log(`Generated patch for ${version} with server address: ${address}`);
    copyBtn.removeAttribute('disabled');
    downloadBtn.removeAttribute('disabled');
}
/*#endregion*/

/*
█ █ █▀▀ █   █▀█ █▀▀ █▀█ █▀
█▀█ ██▄ █▄▄ █▀▀ ██▄ █▀▄ ▄█
*/

/*#region Helpers */
function getPatchFilename(version) {
    const crc = version === 'SLUS-20772' ? '08FFF00D' :
                version === 'SLES-51697-1' ? 'CE942B2A' : '2326C41A';
    return `${version}_${crc}.pnach`;
}

function download(filename, text) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/*#endregion*/

/*
█▀▀ █ █ █▀▀ █▄ █ ▀█▀   █ █ ▄▀█ █▄ █ █▀▄ █   █▀▀ █▀█ █▀
██▄ ▀▄▀ ██▄ █ ▀█  █    █▀█ █▀█ █ ▀█ █▄▀ █▄▄ ██▄ █▀▄ ▄█
*/

/*#region Event Handlers */
// Live updates
document.getElementById('gameVersion').addEventListener('change', updatePatch);
document.getElementById('serverAddress').addEventListener('input', updatePatch);

// Copy button
document.getElementById('copyButton').addEventListener('click', async () => {
    const patchContent = document.getElementById('patchCode').textContent;
    if (patchContent.includes('Select version')) return;
    
    try {
        await navigator.clipboard.writeText(patchContent);
        const button = document.getElementById('copyButton');
        button.textContent = 'Copied!';
        setTimeout(() => button.textContent = 'Copy to Clipboard', 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Download button
document.getElementById('downloadButton').addEventListener('click', () => {
    const patchContent = document.getElementById('patchCode').textContent;
    if (patchContent.includes('Select version')) return;
    
    const version = document.getElementById('gameVersion').value;
    const filename = getPatchFilename(version);
    
    download(filename, patchContent);
});
/*#endregion*/
