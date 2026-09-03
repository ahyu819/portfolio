(function () {
    var wrap = document.getElementById("shapegrid");
    if (!wrap) return;

    var canvas = document.createElement("canvas");
    wrap.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    var size = 40;
    var hexHoriz = size * 1.5;
    var hexVert = size * Math.sqrt(3);
    var speed = 0.24;
    var offsetX = 0;

    function gridAlpha() {
        var light = document.documentElement.getAttribute("data-theme") === "light";
        var rgb = light ? "16, 18, 22" : "255, 255, 255";
        var maxA = light ? 0.1 : 0.2;
        return { rgb: rgb, maxA: maxA };
    }

    function resize() {
        canvas.width = Math.round(wrap.clientWidth * dpr);
        canvas.height = Math.round(wrap.clientHeight * dpr);
    }
    window.addEventListener("resize", resize);
    resize();

    function drawHex(cx, cy) {
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var a = (Math.PI / 3) * i;
            var px = cx + size * Math.cos(a);
            var py = cy + size * Math.sin(a);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    function frame() {
        requestAnimationFrame(frame);
        offsetX = (offsetX + speed) % (hexHoriz * 2);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var h = canvas.height;

        var cols = Math.ceil(canvas.width / hexHoriz) + 4;
        var rows = Math.ceil(h / hexVert) + 4;

for (var col = -3; col < cols; col++) {
            var colShift = Math.floor(offsetX / hexHoriz);
            var offX = ((offsetX % hexHoriz) + hexHoriz) % hexHoriz;
            for (var row = -2; row < rows; row++) {
                var cx = (col * hexHoriz + offX) * dpr;
                var cy = (row * hexVert + (col + colShift) % 2 !== 0 ? hexVert / 2 : 0) * dpr;

                var fade = 1 - cy / (h + hexVert * 2);
                fade = Math.max(0, Math.min(1, fade));
                fade = fade * fade;

                var g = gridAlpha();
                ctx.strokeStyle = "rgba(" + g.rgb + ", " + (g.maxA * fade).toFixed(3) + ")";
                ctx.lineWidth = 1 * dpr;
                drawHex(cx, cy);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(frame);
})();