/* ======= Model ======= */
var model = {
    data: [
        {
            name: "Benjamin",
            image: "images/benjamin.jpg",
            count: 0
        },
        {
            name: "Leia",
            image: "images/leia.jpg",
            count: 0
        },
        {
            name: "Agamemnon",
            image: "images/agamemnon.jpg",
            count: 0
        },
        {
            name: "Franklin",
            image: "images/franklin.jpg",
            count: 0
        },
        {
            name: "Tom",
            image: "images/tom.jpg",
            count: 0
        }
    ],

    list: function() {
        return this.data.map(e=>{return {name: e.name};});
    },
    create: function(data) {
        if (!data.name || !data.image) return null;
        this.data.push({name: data.name, image: data.image, count: data.count?data.count:0});
        return this.data.length - 1;
    },
    get: function(id) {
        return this.data[id];
    },
    set: function(id, data) {
        if (data.name) this.data[id].name = data.name;
        if (data.image) this.data[id].image = data.image;
        if (data.count !== undefined) this.data[id].count = data.count;
    },
    incrementCount: function(id) {
        this.data[id].count++;
    }
};

/* ======= Controller ======= */
var octopus = {
    init: function() {
        catView.init();
        catView.catList(model.list());

        let cat = model.get(0);
        cat.id = 0;
        catView.catView(cat);
        catView.adminView(cat);
    },
    catClick: function(id) {
        let cat = model.get(id);
        cat.id = id;
        catView.catView(cat);
        catView.adminView(cat);
    },
    incrementCounter: function(id) {
        model.incrementCount(id);
        let cat = model.get(id);
        cat.id = id;
        catView.catView(cat);
        catView.adminView(cat);
    },
    toggleAdmin: function() {
        catView.toggleAdmin();
    },
    updateCat: function(data) {
        model.set(data.id, data);
        let cat = model.get(data.id);
        cat.id = data.id;
        catView.catView(cat);
        catView.adminView(cat);
        catView.toggleAdmin();
    },
    createCat: function(data) {
        catView.toggleAdmin();

        let id = model.create(data);
        if (id === null) return;

        catView.catList(model.list());
        let cat = model.get(id);
        cat.id = id;
        catView.catView(cat);
        catView.adminView(cat);
    }
};

/* ======= View ======= */
var catView = {
    showAdmin: false,
    pages: {},

    init: function() {
        this.catListInit();
        this.catViewInit();
        this.adminViewInit();
    },

    // List View
    catListInit: function() {
        this.pages[catList] = document.getElementById('catList');
    },
    catList: function(data) {
        this.pages[catList].innerHTML = '';

        data.forEach((e,i)=>{
            let li = document.createElement('li');
            li.textContent = e.name;
            li.addEventListener('click', ()=>octopus.catClick(i));
            this.pages[catList].appendChild(li);
        });
    },

    // Cat View
    catViewInit: function() {
        this.pages.catView = {
            name: document.getElementById('cat-name'),
            image: document.getElementById('cat-img'),
            count: document.getElementById('cat-count')
        };
        this.pages.catView.image.addEventListener('click', ()=>octopus.incrementCounter(
            document.getElementById('updateForm').elements['catId'].value
        ));
    },
    catView: function(data) {
        this.pages.catView.name.textContent = data.name;
        this.pages.catView.image.src = data.image;
        this.pages.catView.count.textContent = data.count;
    },

    // Admin View
    adminViewInit: function() {
        let form = document.getElementById('updateForm');

        let id = document.createElement('input');
        id.type = 'hidden';
        id.name = 'catId';
        id.value = '0';
        form.appendChild(id);

        let newBtn = document.createElement('button');
        newBtn.id = 'catNew';
        newBtn.textContent = 'New';
        document.getElementById('adminForm').appendChild(newBtn);

        this.pages.adminView = {
            form: document.getElementById('adminForm'),
            id: id,
            name: form.elements['catName'],
            image: form.elements['catImage'],
            count: form.elements['catClicks']
        };
        document.getElementById('adminBtn').addEventListener('click', ()=>{
            octopus.toggleAdmin();
        });
        document.getElementById('saveBtn').addEventListener('click', ()=>{
            let cat = {};
            cat.id = form.elements['catId'].value;
            if (form.elements['catName'].value) cat.name = form.elements['catName'].value;
            if (form.elements['catImage'].value) cat.image = form.elements['catImage'].value;
            if (form.elements['catClicks'].value !== '') cat.count = form.elements['catClicks'].value;
            octopus.updateCat(cat);
        });
        document.getElementById('cancelLink').addEventListener('click', ()=>{
            form.elements['catName'].value = '';
            form.elements['catImage'].value = '';
            form.elements['catClicks'].value = '';
            this.toggleAdmin();
        });
        newBtn.addEventListener('click', ()=>{
            let cat = {};
            cat.name = form.elements['catName'].value;
            cat.image = form.elements['catImage'].value;
            cat.count = form.elements['catClicks'].value;
            octopus.createCat(cat);
        });
    },
    adminView: function(data) {
        this.pages.adminView.id.value = data.id;
        ['name','image','count'].forEach(e=>{
            this.pages.adminView[e].value = '';
            this.pages.adminView[e].placeholder = data[e];
        });
    },
    toggleAdmin: function() {
        if (this.showAdmin) {
            this.showAdmin = false;
            this.pages.adminView.form.classList.add('closed');
        } else {
            this.showAdmin = true;
            this.pages.adminView.form.classList.remove('closed');
        }
    }
};

/* ======= Initialize ======= */

octopus.init();
