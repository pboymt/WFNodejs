async function fetchDeviceList() {
    const res = await fetch('/devices');
    const list = await res.json();
    if (list instanceof Array) {
        return list;
    } else {
        return [];
    }
}

async function setDeviceList(list) {
    const select = document.getElementById('selected-device');
    if (select) {
        select.innerHTML = '';
        for (const device of list) {
            const option = document.createElement('option');
            option.value = device.id;
            option.textContent = device.id;
            select.appendChild(option);
        }
    }
}

async function fetchScreencap() {
    const device = document.getElementById('selected-device').value;
    const url = new URL('/screencap', location.origin);
    url.searchParams.append('device', device);
    const res = await fetch(url);
    const blob = await res.blob();
    console.log(blob);
    const canvas = document.querySelector('canvas');
    if (canvas) {
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        canvas.getContext('2d').drawImage(img, 0, 0);
    }
}

(async () => {

    await setDeviceList(await fetchDeviceList());

    const btn_screenshot = document.getElementById('screenshot');
    btn_screenshot.addEventListener('click', fetchScreencap);

})();