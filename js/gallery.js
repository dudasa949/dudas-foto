document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('topics-grid')) {
        renderGalleryGrid('all');
    }
});

const topicsData = [
    {
        category: "rally",
        title: "Muhi RallyXtreme - Gyorsasági szakaszok",
        badge: "MOTORSPORT / 20-AS SOROZAT",
        desc: "Nyers akciófotók a hazai rallycross bajnokságról, por, kanyarok és szervizparki pillanatok részletesen bemutatva.",
        images: [
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        category: "commercial",
        title: "Prémium Használtautó Portfólió",
        badge: "COMMERCIAL / 15-ÖS SOROZAT",
        desc: "Külvilági profilok, belső terek, műszerfal részletek és felnik nagypontosságú hirdetési fotósorozata.",
        images: [
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop"
        ]
    },
    {
        category: "rally",
        title: "Viszló Rally Stage",
        badge: "MOTORSPORT / 22-ES SOROZAT",
        desc: "Erdős, technikás pályaszakaszok, izgalmas ívek és versenyhangulat a Panasonic Lumix lencséjén keresztül.",
        images: [
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop"
        ]
    }
];

let cardStates = [0, 0, 0];
let currentFilter = 'all';

function renderGalleryGrid(filterCategory) {
    currentFilter = filterCategory;
    const grid = document.getElementById('topics-grid');
    if (!grid) return;
    grid.innerHTML = '';

    topicsData.forEach((topic, topicIdx) => {
        if (filterCategory !== 'all' && topic.category !== filterCategory) return;

        const currentSlide = cardStates[topicIdx];
        let mediaHTML = '';

        if (currentSlide < 3) {
            mediaHTML = `<img src="${topic.images[currentSlide]}" class="w-full h-full object-cover transition-opacity duration-300">`;
        } else {
            mediaHTML = `
                <div class="w-full h-full bg-gradient-to-br from-accent/30 via-darkbg to-cardbg flex flex-col items-center justify-center p-6 text-center space-y-3 cursor-pointer" onclick="openTopicModal(${topicIdx})">
                    <i class="fa-solid fa-up-right-and-down-left-from-center text-accent text-3xl animate-bounce"></i>
                    <h4 class="font-bold text-white text-base">Tekintsd meg a teljes galériát!</h4>
                    <p class="text-xs text-gray-300">A teljes sorozat még több mint 15+ képet tartalmaz nagy felbontásban.</p>
                    <span class="bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg">Megnyitás</span>
                </div>
            `;
        }

        // Pöttyök generálása
        let dotsHTML = '';
        for (let i = 0; i < 3; i++) {
            const activeClass = (i === currentSlide) ? 'bg-accent w-4' : 'bg-white/40 w-2';
            dotsHTML += `<span class="h-2 rounded-full transition-all ${activeClass}"></span>`;
        }

        const cardHTML = `
            <div class="gallery-item bg-cardbg border border-gray-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl">
                <!-- Kép konténer fix magassággal -->
                <div class="relative w-full aspect-[4/3] overflow-hidden group bg-black flex-shrink-0">
                    ${mediaHTML}
                    
                    <button onclick="prevCardSlide(${topicIdx}, event)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center z-20 text-xs transition">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button onclick="nextCardSlide(${topicIdx}, event)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center z-20 text-xs transition">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>

                    <!-- Pöttyök és számláló pontosan középre igazítva a kép alján -->
                    <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full z-20 shadow-md">
                        ${dotsHTML}
                        <span class="text-[10px] text-gray-300 font-medium ml-1.5">+15 kép</span>
                    </div>
                </div>

                <!-- Szöveges rész fixen illeszkedő flex dobozzal, hogy minden kártya szövege egy vonalban kezdődjön -->
                <div class="p-6 flex flex-col flex-grow justify-between space-y-2">
                    <div>
                        <span class="text-xs font-semibold text-accent uppercase tracking-wider block mb-1">${topic.badge}</span>
                        <h3 class="text-xl font-bold text-white">${topic.title}</h3>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed">${topic.desc}</p>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function nextCardSlide(topicIdx, event) {
    event.stopPropagation();
    cardStates[topicIdx] = (cardStates[topicIdx] + 1) % 4;
    renderGalleryGrid(currentFilter);
}

function prevCardSlide(topicIdx, event) {
    event.stopPropagation();
    cardStates[topicIdx] = (cardStates[topicIdx] - 1 + 4) % 4;
    renderGalleryGrid(currentFilter);
}

function filterGallery(category, clickedBtn) {
    // Gombok stílusának frissítése (hogy a kiválasztott maradjon sárga/narancs, többi sötét)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-accent', 'text-white', 'shadow-lg');
        btn.classList.add('bg-cardbg', 'border', 'border-gray-800', 'text-gray-400');
    });
    if (clickedBtn) {
        clickedBtn.classList.remove('bg-cardbg', 'border', 'border-gray-800', 'text-gray-400');
        clickedBtn.classList.add('bg-accent', 'text-white', 'shadow-lg');
    }
    renderGalleryGrid(category);
}

// Modal kezelés
let currentModalTopic = 0;
let currentModalImgIdx = 0;

function openTopicModal(idx) {
    currentModalTopic = idx;
    currentModalImgIdx = 0;
    updateModalContent();
    document.getElementById('lightbox-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('lightbox-modal').style.display = 'none';
}

function updateModalContent() {
    const topic = topicsData[currentModalTopic];
    document.getElementById('modal-img').src = topic.images[currentModalImgIdx];
    document.getElementById('modal-title').textContent = topic.title;
    document.getElementById('modal-desc').textContent = topic.desc;
    document.getElementById('image-counter').textContent = `${currentModalImgIdx + 1} / ${topic.images.length}`;
}

function nextImage() {
    const topic = topicsData[currentModalTopic];
    currentModalImgIdx = (currentModalImgIdx + 1) % topic.images.length;
    updateModalContent();
}

function prevImage() {
    const topic = topicsData[currentModalTopic];
    currentModalImgIdx = (currentModalImgIdx - 1 + topic.images.length) % topic.images.length;
    updateModalContent();
}
