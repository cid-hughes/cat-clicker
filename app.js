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
    prefix: "cat_",
    keyLen: 10,
    fields: [],

    h2s: function(hash) {
        return Object.keys(hash).reduce((a,k)=>{
            a.push(k);
            a.push(hash[k]);
            return a;
        }, []).join(",");
    },
    s2h: function(str) {
        if (!str) return {};
        let key;
        return str.split(",").reduce((a,v)=>{
            if (key) {
                a[key] = v;
                key = '';
            } else key = v;
            return a;
        }, {});
    },
    getLength: function() {
        return parseInt(localStorage.getItem(this.prefix + 'length'));
    },
    setLength: function(len) {
        localStorage.setItem(this.prefix + 'length', len);
    },
    getItem: function(id) {
        return this.s2h(localStorage.getItem(this.prefix + id));
    },
    setItem: function(id, data) {
        localStorage.setItem(this.prefix + id, this.h2s(data));
    },
    removeItem: function(id) {
        localStorage.removeItem(this.prefix + id);
    },
    shiftItem: function(id) {
        localStorage.setItem(this.prefix + id, localStorage.getItem(this.prefix + (parseInt(id) + 1)));
    },
    // [0-9][A-Z:65-90][a-z:97-122]
    // [62 = 10 + 26 + 26][35 = 90 - 48 - 7]
    // [7 = 65 - 58][6 = 97 - 91]
    // [55 = 48 + 7][61 = 48 + 7 + 6]
    keyGen: function(len) {
        let arr = new Array(len), c;
        while(len--) {
            c = Math.floor(Math.random() * 62);
            arr[len] = c>9 ? String.fromCharCode(c>35 ? c+61 : c+55) : c;
        }
        return arr.join('');
    },

    init: function() {
        this.fields = Object.keys(this.data[0]);
        if (this.getLength()) return;
        this.setLength(this.data.length);
        this.data.forEach((h,i)=>{
            // TODO: add key and time fields
            this.setItem(i, h);
        });
    },

    list: function() {
        let list=[], len=this.getLength();
        for (let i=0; i<len; i++) {
            list.push({id: i, name: this.getItem(i)['name']});
        }
        return list;
    },
    insert: function(data) {
        if (!data.name || !data.image) return null;
        let hash, len = this.getLength();
        this.setLength(len + 1);
        // TODO: if name run html entity scrub
        hash = this.fields.reduce((a,e)=>{
            a[e] = data[e] || 0;
            return a;
        }, {});
        // TODO: add key and time fields
        this.setItem(len, hash);
        return len;
    },
    select: function(id) {
        if (typeof parseInt(id)!=="number" || id<0 || id>=this.getLength()) return;
        let data = this.getItem(id);
        // delete data.key;
        // delete data.time;
        data['fields'] = this.fields.slice(0);
        data['id'] = id;
        return data;
    },
    update: function(data) {
        if (typeof parseInt(data.id)!=="number" || data.id<0 || data.id>=this.getLength()) return;
        let hash = this.getItem(data.id);
        // TODO: check for key and key matches in entry
        this.fields.forEach(k=>{
            if (data[k]!==undefined) hash[k] = data[k];
        });
        this.setItem(data.id, hash);
    },
    remove: function(id) {
        let len = this.getLength();
        if (typeof parseInt(id)!=="number" || id<0 || id>=len || len<2) return;
        // TODO: check for key and key matches in entry
        len--;
        for (let i=parseInt(id); i<len; i++) this.shiftItem(i);
        this.removeItem(len);
        this.setLength(len);
    },
    incrementCount: function(id) {
        if (typeof parseInt(data.id)!=="number" || data.id<0 || data.id>=this.getLength()) return;
        let hash = this.getItem(data.id);
        // TODO: check if key is present in entry, no key is required to update the value but updating value while an update is pending is pointless
        hash.count++;
        this.setItem(id, hash);
    },
    getKey: function(id) {

    },
    //checkKey: function(id, key) {

    //},
    clearKey: function(id) {

    }
}

/* ======= Controller ======= */
var octopus = {
    init: function() {
        model.init();
        let cat = model.select(0);
        catView.init(cat.fields);
        this.refresh(cat);
    },
    dump: function() {
        localStorage.clear();
        octopus.init();
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
            octopus.dump();
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

