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
        },
        {
            name: "Ajax",
            image: "images/ajax.jpg",
            count: 0
        },
        {
            name: "Archimedes",
            image: "images/archimedes.jpg",
            count: 0
        }
    ],
    fields: [],
    keyLen: 10,
    keyExpire: 1 * 60 * 1000,//1 minute

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
        return arr.join("");
    },
    scrub: function(str) {
        let div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
//        return str.replace(/[&<>'"/g, c=>({
//            "&": "&amp;",
//            "<": "&lt;",
//            ">": "&gt;",
//            "'": "&apos;",
//            '"': "&quot;"
//        })[c]);
    },

    init: function() {
        //localStorage.clear();// Temporary!

        this.fields = Object.keys(this.data[0]);
        if (parseInt(localStorage.getItem("cat_length")) && localStorage.getItem("cat_0").substr(0, 1)=="{") return;
        localStorage.setItem("cat_length", this.data.length);
        this.data.forEach((h,i)=>{
            h.key = "";
            h.keyTime = "";
            localStorage.setItem("cat_" + i, JSON.stringify(h));
        });
    },

    list: function() {
        let list = [], len = parseInt(localStorage.getItem("cat_length"));
        for (let i=0; i<len; i++)
            list.push({id: i, name: JSON.parse(localStorage.getItem("cat_" + i))["name"]});
        return list;
    },
    insert: function(data) {
        let msg;
        this.clearKey(data.id, data.key);
        if (!data.name || !data.image) {
            msg = "Unable to create new cat. Please fill in Name and Image!";
            console.log(msg);
            return msg;
        }
        let hash, len = parseInt(localStorage.getItem("cat_length"));
        localStorage.setItem("cat_length", len + 1);
        hash = this.fields.reduce((a,f)=>{
            a[f] = data[f] || 0;// removed scrub
            return a;
        }, {});
        hash.key = "";
        hash.keyTime = "";
        localStorage.setItem("cat_" + len, JSON.stringify(hash));
        return len;
    },
    select: function(id) {
        let msg;
        if (id<0 || id>=parseInt(localStorage.getItem("cat_length"))) {
            msg = "Cat ID out of range!";
            console.log(msg);
            return msg;
        }
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        delete hash.key;
        delete hash.keyTime;
        hash["fields"] = this.fields.slice(0);
        hash["id"] = id;
        return hash;
    },
    update: function(data) {
        let msg;
        if (!this.checkKey(data.id, data.key)) {
            msg = "Unable to update cat! Invalid key submitted.";
            console.log(msg);
            return msg;
        }
        this.clearKey(data.id, data.key);
        if (data.id<0 || data.id>=parseInt(localStorage.getItem("cat_length"))) {
            msg = "Unable to update cat! Cat ID out of range.";
            console.log(msg);
            return msg;
        }
        let hash = JSON.parse(localStorage.getItem("cat_" + data.id));
        this.fields.forEach(f=>{
            if (data[f]!==undefined) hash[f] = data[f];// removed scrub
        });
        localStorage.setItem("cat_" + data.id, JSON.stringify(hash));
    },
    remove: function(data) {
        let msg;
        if (!this.checkKey(data.id, data.key)) {
            msg = "Unable to remove cat! Invalid key submitted.";
            console.log(msg);
            return msg;
        }
        this.clearKey(data.id, data.key);
        let len = parseInt(localStorage.getItem("cat_length"));
        if (data.id<0 || data.id>= len || len<2) {
            msg = "Unable to remove cat! Cat ID is out of range or there are not enough cats.";
            console.log(msg);
            return msg;
        }
        len--;
        for (let i=parseInt(data.id); i<len; i++)
            localStorage.setItem("cat_" + i, localStorage.getItem("cat_" + (i + 1)));
        localStorage.removeItem("cat_" + len);
        localStorage.setItem("cat_length", len);
    },
    incrementCount: function(id) {
        let msg;
        if (id<0 || id>=parseInt(localStorage.getItem("cat_length"))) {
            msg = "Unable to click cat! Cat ID out of range.";
            console.log(msg);
            return msg;
        }
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        hash.count++;
        localStorage.setItem("cat_" + id, JSON.stringify(hash));
    },

    getKey: function(id) {
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        if (hash.key && parseInt(hash.keyTime) + this.keyExpire > Date.now()) return false;
        hash.key = this.keyGen(this.keyLen);
        hash.keyTime = Date.now();
        localStorage.setItem("cat_" + id, JSON.stringify(hash));
        return hash.key;
    },
    checkKey: function(id, key) {
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        if (hash.key===key && parseInt(hash.keyTime) + this.keyExpire > Date.now()) return true;
        return false;
    },
    clearKey: function(id, key) {
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        if (hash === null || (hash.key!==key && parseInt(hash.keyTime)) + this.keyExpire > Date.now()) return;
        hash.key = "";
        hash.keyTime = "";
        localStorage.setItem("cat_" + id, JSON.stringify(hash));
    }
};
var controller = {
    init: function() {
        model.init();
        let data = model.select(0);
        view.init(data.fields);
        this.refresh(0);
    },
    reset: function() {
        let data = view.formState();
        if (data.showForm) controller.toggle();
        localStorage.clear()
        controller.init();
    },

    refresh: function(id) {
        let data = model.select(id);
        if (typeof data == "string") return view.messageView(data);
        else {
            view.view(data);
            view.formView(data);
        }
        view.listView(model.list());
    },

    toggle: function() {
        let data = view.formState(), key;
        if (data.showForm) {
            model.clearKey(data.id, data.key);
            view.toggle();
        } else if (key = model.getKey(data.id)) {
            view.toggle(key);
        } else {
            view.messageView("Failed to generate a key! Another user may be updating this cat.");
        }
    },
    click: function(id) {
        let data = view.formState();
        if (data.showForm) this.toggle();
        this.refresh(id);
    },
    incrementCounter(id) {
        let res = model.incrementCount(id);
        if (res) view.messageView(res);
        this.refresh(id);
    },
    create: function(data) {
        let res = model.insert(data);
        this.toggle();
        if (typeof res == "string") {
            view.messageView(res);
            res = data.id;
        }
        this.refresh(res);
    },
    update: function(data) {
        let res = model.update(data);
        this.toggle();
        if (typeof res == "string") view.messageView(res);
        this.refresh(data.id);
    },
    remove: function(data) {
        let res = model.remove(data);
        this.toggle();
        if (typeof res == "string") view.messageView(res);
        this.refresh(0);
    }
};
var view = {
    showForm: false,
    links: {},
    formTimeout: model.keyExpire,
    msgTimeout: 10 * 1000,// 10 seconds
    timer: {
        "tgl": 0,
        "msg": 0
    },

    init: function(fields) {
        this.messageInit();
        this.listInit();
        this.viewInit(fields);
        this.formInit(fields);
    },

    // Misc
    formState: function() {
        return {
            id: this.links.form.id.value,
            key: this.links.form.key.value,
            showForm: this.showForm
        };
    },
    unscrub: function(str) {
        let div = document.createElement("div");
        div.innerHTML = str;
        let child = div.childNodes[0];
        return child ? child.nodeValue : "";
    },
    toggle: function(key) {
        if (this.showForm) {
            this.showForm = false;
            clearTimeout(this.timer.tgl);
            this.links.form.key.value = "";
            document.getElementById("left").style.width = "0px";
        } else {
            this.showForm = true;
            this.links.form.key.value = key;
            document.getElementById("left").style.width = "290px";
            this.timer.tgl = setTimeout(controller.toggle, view.formTimeout);
        }
    },

    // Messages
    messageInit: function() {
        this.links.msg = document.getElementById("msg");
    },
    messageView: function(str) {
        this.messageClear();
        this.links.msg.appendChild(document.createTextNode(str));
        this.timer.msg = setTimeout(view.messageClear, this.msgTimeout);
    },
    messageClear: function() {
        if (!view.timer.msg) return;
        clearTimeout(view.timer.msg);
        view.timer.msg = 0;
        view.links.msg.innerHTML = "";
    },

    // List
    listInit: function() {
        this.links.list = document.getElementById("menu");
    },
    listView: function(data) {
        this.links.list.innerHTML = "";
        data.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0).forEach(el=>{
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(el.name));// removed unscrub
            li.addEventListener("click", ev=>{
                ev = ev || window.event;
                let target = ev.target || ev.srcElement, last = document.getElementsByClassName("selected");
                if (last.length) last[0].classList.remove("selected");
                target.classList.add("selected");
                controller.click(el.id);
            });
            if (this.links.form.id.value == el.id) li.classList.add("selected");
            this.links.list.appendChild(li);
        });
    },

    // View
    viewInit: function(fields) {
        this.links.view = {};
        fields.forEach(f=>this.links.view[f] = document.getElementById("view-" + f));
        this.links.view.image.addEventListener("click", ()=>controller.incrementCounter(
            document.getElementById("form-id").value
        ));
    },
    view: function(data) {// May come back and change this to use text nodes
        data.fields.forEach(f=>this.links.view[f][ f=="image"?"src":"textContent" ] = data[f]);// removed unscrub
    },

    // Form
    formInit: function(fields) {
        this.links.form = {
            id: document.getElementById("form-id"),
            key: document.getElementById("form-key")
        };
        fields.forEach(f=>this.links.form[f] = document.getElementById("form-" + f));

        document.getElementById("edit").addEventListener("click", controller.toggle);
        document.getElementById("btn-new").addEventListener("click", ()=>{
            let data = { id: this.links.form.id.value, key: this.links.form.key.value };
            fields.forEach(f=>data[f] = this.links.form[f].value);
            controller.create(data);
        });
        document.getElementById("btn-save").addEventListener("click", ()=>{
            let data = { id: this.links.form.id.value, key: this.links.form.key.value };
            fields.forEach(f=>{
                if (this.links.form[f].value !== "") data[f] = this.links.form[f].value;
            });
            controller.update(data);
        });
        document.getElementById("btn-cancel").addEventListener("click", ()=>{
            fields.forEach(f=>this.links.form[f].value = "");
            controller.toggle();
        });
        document.getElementById("btn-delete").addEventListener("click", ()=>{
            controller.remove({ id: this.links.form.id.value, key: this.links.form.key.value });
        });
        document.getElementById("btn-reset").addEventListener("click", controller.reset);
    },
    formView: function(data) {
        this.links.form.id.value = data.id;
        data.fields.forEach(f=>{
            this.links.form[f].value = "";
            this.links.form[f].placeholder = data[f];// removed unscrub
        });
    }
};