'use strict';

let loader = null;

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
});

function initLoader() {
    loader = document.getElementById('loader');

    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.className = 'loader hide';
        loader.innerHTML = `<img src="../assets/gifs/loader.gif" alt="Loading...">`;
        document.body.appendChild(loader);
    }
}

function showLoader() {
    if (!loader) {
        initLoader();
    }
    loader.classList.remove('hide');
}

function hideLoader() {
    loader?.classList.add('hide');
}
