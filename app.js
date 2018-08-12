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
        return this.data.map((e,i)=>{ return {id: i, name: e.name}; });
    },
    insert: function(data) {
        if (!data.name || !data.image) return null;
        this.data.push(Object.keys(this.data[0]).reduce((a,e)=>{
            a[e] = data[e]?data[e]:0;
            return a;
        }, {}));
        return this.data.length - 1;
    },
    select: function(id) {
        if (typeof parseInt(id)!=="number" || id<0 || id>=this.data.length) return;
        let data = Object.create(this.data[id]);
        data['fields'] = Object.keys(this.data[id]);
        data['id'] = id;
        return data;
    },
    update: function(data) {
        if (typeof parseInt(data.id)!=="number" || data.id<0 || data.id>=this.data.length) return;
        Object.keys(this.data[data.id]).forEach(e=>{ if (data[e]!==undefined) this.data[data.id][e]=data[e]; });
    },
    remove: function(id) {
        if (typeof parseInt(id)!=="number" || id<0 || id>=this.data.length || this.data.length<2) return;
        this.data.splice(id, 1);
    },
    incrementCount: function(id) {
        if (typeof parseInt(id)!=="number" || id<0 || id>=this.data.length) return;
        this.data[id].count++;
    }
};

/* ======= Controller ======= */
var octopus = {
    init: function() {
        let cat = model.select(0);
        catView.init(cat.fields);
        this.refresh(cat);
    },
    refresh: function(data) {
        catView.catList(model.list());
        catView.catView(data);
        catView.adminView(data);
    },
    catClick: function(id) {
        this.refresh(model.select(id));
    },
    incrementCounter: function(id) {
        model.incrementCount(id);
        this.refresh(model.select(id));
    },
    toggleAdmin: function() {
        catView.toggleAdmin();
    },
    updateCat: function(data) {
        catView.toggleAdmin();
        model.update(data);
        this.refresh(model.select(data.id));
    },
    newCat: function(data) {
        catView.toggleAdmin();
        let id = model.insert(data);
        if (id === null) return;
        this.refresh(model.select(id));
    },
    removeCat: function(id) {
        catView.toggleAdmin();
        model.remove(id);
        this.refresh(model.select(0));
    }
};

/* ======= View ======= */
var catView = {
    showAdmin: false,
    pages: {},

    init: function(fields) {
        this.catListInit();
        this.catViewInit(fields);
        this.adminViewInit(fields);
    },

    // List View
    catListInit: function() {
        this.pages.catList = document.getElementById('catList');
    },
    catList: function(data) {
        this.pages.catList.innerHTML = '';
        data.forEach(e=>{
            let li = document.createElement('li');
            li.textContent = e.name;
            li.addEventListener('click', ()=>octopus.catClick(e.id));
            this.pages.catList.appendChild(li);
        });
    },

    // Cat View
    catViewInit: function(fields) {
        this.pages.catView = {};
        fields.forEach(p=>this.pages.catView[p] = document.getElementById('card-' + p));
        this.pages.catView.image.addEventListener('click', ()=>octopus.incrementCounter(
            document.getElementById('updateForm').elements['form-id'].value
        ));
    },
    catView: function(data) {
        data.fields.forEach(p=>this.pages.catView[p][ p=='image'?'src':'textContent' ] = data[p]);
    },

    // Admin View
    adminViewInit: function(fields) {
        let form = document.getElementById('updateForm');
        this.pages.adminView = {};
        this.pages.adminView.form = document.getElementById('adminForm');
        this.pages.adminView.id = form.elements['form-id'];
        fields.forEach(p=>this.pages.adminView[p] = form.elements['form-' + p]);

        document.getElementById('btn-admin').addEventListener('click', ()=>{
            octopus.toggleAdmin();
        });
        document.getElementById('btn-new').addEventListener('click', ()=>{
            let cat = {};
            fields.forEach(p=>cat[p] = this.pages.adminView[p].value);
            octopus.newCat(cat);
        });
        document.getElementById('btn-save').addEventListener('click', ()=>{
            let cat = { id: this.pages.adminView.id.value };
            fields.forEach(p=>{
                if (this.pages.adminView[p].value !=='') cat[p] = this.pages.adminView[p].value;
            });
            octopus.updateCat(cat);
        });
        document.getElementById('btn-cancel').addEventListener('click', ()=>{
            fields.forEach(p=>this.pages.adminView[p].value = '');
            this.toggleAdmin();
        });
        document.getElementById('btn-delete').addEventListener('click', ()=>{
            octopus.removeCat(this.pages.adminView.id.value);
        });

        document.getElementById('btn-dump').addEventListener('click', ()=>{
            model.data.forEach((e,i)=>Object.keys(model.data[0]).forEach(p=>console.log(i+'-'+p+':'+e[p])));
        });
    },
    adminView: function(data) {
        this.pages.adminView.id.value = data.id;
        data.fields.forEach(p=>{
            this.pages.adminView[p].value = '';
            this.pages.adminView[p].placeholder = data[p];
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

window.onload = function() {
    octopus.init();
};
