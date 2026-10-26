let layers = [];

function updateTableAndCalc() {
    const tbody = document.getElementById('layerBody');
    tbody.innerHTML = '';
    let totalLot = 0;
    let totalValue = 0;

    // Render ulang tabel tiap ada perubahan
    layers.forEach((layer, index) => {
        totalLot += layer.lot;
        totalValue += (layer.price * layer.lot);
        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${layer.price.toFixed(2)}</td>
                <td>${layer.lot.toFixed(2)}</td>
                <td><button class="btn-delete" onclick="removeLayer(${index})">Hapus</button></td>
            </tr>
        `;
    });

    calculateBEP(totalLot, totalValue);
}

function calculateBEP(totalLot, totalValue) {
    const resultText = document.getElementById('resultText');

    if (layers.length === 0) {
        resultText.innerHTML = 'Belum ada posisi yang di-input.';
        return;
    }

    const posType = document.getElementById('posType').value;
    const pointValue = parseFloat(document.getElementById('pointValue').value) || 0;
    const spread = parseFloat(document.getElementById('spread').value) || 0;
    const feePerLot = parseFloat(document.getElementById('feePerLot').value) || 0;

    // Hitung rata-rata harga (Average Price)
    const avgPrice = totalValue / totalLot;
    
    // Hitung beban Fee dalam bentuk poin biar bisa digabung sama harga
    const feeInPoints = (feePerLot / pointValue); 
    
    // Total beban yang harus dilewati pasar biar balik modal
    const extraPoints = spread + feeInPoints;

    let bepPrice = 0;
    // Logika BEP: Kalo Buy, harga harus naik ngelewatin beban. Kalo Sell, harga harus turun.
    if (posType === 'buy') {
        bepPrice = avgPrice + extraPoints;
    } else {
        bepPrice = avgPrice - extraPoints;
    }

    resultText.innerHTML = `
        <p>Total Posisi: <strong>${layers.length} Layer</strong></p>
        <p>Total Lot Berjalan: <strong>${totalLot.toFixed(2)} Lot</strong></p>
        <p>Harga Rata-rata (Avg Entry): <strong>${avgPrice.toFixed(2)}</strong></p>
        <p>Beban Spread & Komisi: <strong>${extraPoints.toFixed(2)} Poin</strong></p>
        <h3 class="bep-highlight">Target BEP Bersih: ${bepPrice.toFixed(2)}</h3>
    `;
}

function addLayerManual() {
    const price = parseFloat(document.getElementById('manualPrice').value);
    const lot = parseFloat(document.getElementById('manualLot').value);
    
    if (isNaN(price) || isNaN(lot) || lot <= 0) {
        return alert('Isi harga dan lot dengan bener dong, masa huruf dimasukin!');
    }
    
    layers.push({ price, lot });
    updateTableAndCalc();
    
    // Kosongin input habis diklik
    document.getElementById('manualPrice').value = '';
    document.getElementById('manualLot').value = '';
}

function addLayerDistance() {
    const distance = parseFloat(document.getElementById('distancePoint').value);
    const lot = parseFloat(document.getElementById('distanceLot').value);
    
    if (isNaN(distance) || isNaN(lot) || lot <= 0) {
        return alert('Isi jarak dan lot dengan bener!');
    }
    
    if (layers.length === 0) {
        return alert('Masukin order pertama pakai opsi manual dulu buat patokan awal!');
    }

    const lastPrice = layers[layers.length - 1].price;
    const posType = document.getElementById('posType').value;

    let newPrice = 0;
    // Kalau Buy, averaging/layer turun. Kalau Sell, averaging naik.
    if (posType === 'buy') {
        newPrice = lastPrice - distance; 
    } else {
        newPrice = lastPrice + distance; 
    }

    layers.push({ price: newPrice, lot });
    updateTableAndCalc();
}

function removeLayer(index) {
    layers.splice(index, 1);
    updateTableAndCalc();
}

// Bikin auto-recalculate kalau settingan dasar (buy/sell, spread, dsb) diubah
document.querySelectorAll('#posType, #pointValue, #spread, #feePerLot').forEach(el => {
    el.addEventListener('change', updateTableAndCalc);
    el.addEventListener('input', updateTableAndCalc);
});
