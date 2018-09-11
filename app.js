let model = Object.create(null);
Object.defineProperties(model, {
    key: { value: Object.create(null) },
    cat: { value: Object.create(null) },

    init: { value: function() {
        //localStorage.clear();// Temporary!

        if (this.cat.len && localStorage.getItem("cat_0").substr(0, 1)=="{") return;

        this.cat.insert({ name: "Benjamin",   image: "images/benjamin.jpg",   count: 0, key: "", keyTime: "" });
        this.cat.insert({ name: "Leia",       image: "images/leia.jpg",       count: 0, key: "", keyTime: "" });
        this.cat.insert({ name: "Agamemnon",  image: "images/agamemnon.jpg",  count: 0, key: "", keyTime: "" });
        this.cat.insert({ name: "Franklin",   image: "images/franklin.jpg",   count: 0, key: "", keyTime: "" });
        this.cat.insert({ name: "Tom",        image: "images/tom.jpg",        count: 0, key: "", keyTime: "" });
        this.cat.insert({ name: "Ajax",       image: "images/ajax.jpg",       count: 0, key: "", keyTime: "" });
        this.cat.insert({ name: "Archimedes", image: "images/archimedes.jpg", count: 0, key: "", keyTime: "" });
    }}
});
Object.defineProperties(model.key, {
    len: { value: 10 },
    expire: { value: 1 * 60 * 1000 }, // 1 minute

    // [0-9][A-Z:65-90][a-z:97-122]
    // [62 = 10 + 26 + 26][35 = 90 - 48 - 7]
    // [7 = 65 - 58][6 = 97 - 91]
    // [55 = 48 + 7][61 = 48 + 7 + 6]
    gen: { value: function(len) {
        let arr = new Array(len), c;
        while(len--) {
            c = Math.floor(Math.random() * 62);
            arr[len] = c>9 ? String.fromCharCode(c>35 ? c+61 : c+55) : c;
        }
        return arr.join("");
    }},
    fetch: { value: function(id) {
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        if (hash.key && parseInt(hash.keyTime) + this.expire > Date.now()) return false;
        hash.key = this.gen(this.len);
        hash.keyTime = Date.now();
        localStorage.setItem("cat_" + id, JSON.stringify(hash));
        return hash.key;
    }},
    check: { value: function(id, key) {
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        if (hash.key===key && parseInt(hash.keyTime) + this.expire > Date.now()) return true;
        return false;
    }},
    clear: { value: function(id, key) {
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        if (hash === null || (hash.key!==key && parseInt(hash.keyTime)) + this.expire > Date.now()) return;
        hash.key = "";
        hash.keyTime = "";
        localStorage.setItem("cat_" + id, JSON.stringify(hash));
    }}
});
Object.defineProperties(model.cat, {
    fields: { get: ()=>[
        "name",
        "image",
        "count"
    ]},
    len: {
        get: ()=>parseInt(localStorage.getItem("cat_length")),
        set: (len)=>localStorage.setItem("cat_length", len)
    },

    list: { value: function() {
        let list = [], len = this.len;
        for (let i=0; i<len; i++)
            list.push({id: i, name: JSON.parse(localStorage.getItem("cat_" + i))["name"]});
        return list;
    }},
    insert: { value: function(data) {
        let msg;
        model.key.clear(data.id, data.key);
        if (!data.name || !data.image) {
            msg = "Unable to create new cat. Please fill in Name and Image!";
            console.log(msg);
            return msg;
        }
        let hash, len = this.len;
        if (isNaN(len)) len = 0;
        this.len = len + 1;
        hash = this.fields.reduce((a,f)=>{
            a[f] = data[f] || 0;
            return a;
        }, Object.create(null));
        hash.key = "";
        hash.keyTime = "";
        localStorage.setItem("cat_" + len, JSON.stringify(hash));
        return len;
    }},
    select: { value: function(id) {
        let msg;
        if (id<0 || id>=this.len) {
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
    }},
    update: { value: function(data) {
        let msg;
        if (!model.key.check(data.id, data.key)) {
            msg = "Unable to update cat! Invalid key submitted.";
            console.log(msg);
            return msg;
        }
        model.key.clear(data.id, data.key);
        if (data.id<0 || data.id>=this.len) {
            msg = "Unable to update cat! Cat ID out of range.";
            console.log(msg);
            return msg;
        }
        let hash = JSON.parse(localStorage.getItem("cat_" + data.id));
        this.fields.forEach(f=>{
            if (data[f]!==undefined) hash[f] = data[f];
        });
        localStorage.setItem("cat_" + data.id, JSON.stringify(hash));
    }},
    remove: { value: function(data) {
        let msg;
        if (!model.key.check(data.id, data.key)) {
            msg = "Unable to remove cat! Invalid key submitted.";
            console.log(msg);
            return msg;
        }
        model.key.clear(data.id, data.key);
        let len = this.len;
        if (data.id<0 || data.id>=len || len<2) {
            msg = "Unable to remove cat! Cat ID is out of range or there are not enough cats.";
            console.log(msg);
            return msg;
        }
        len--;
        for (let i=parseInt(data.id); i<len; i++)
            localStorage.setItem("cat_" + i, localStorage.getItem("cat_" + (i + 1)));
        localStorage.removeItem("cat_" + len);
        this.len = len;
    }},
    incrementCount: { value: function(id) {
        let msg;
        if (id<0 || id>=this.len) {
            msg = "Unable to click cat! Cat ID out of range.";
            console.log(msg);
            return msg;
        }
        let hash = JSON.parse(localStorage.getItem("cat_" + id));
        hash.count++;
        localStorage.setItem("cat_" + id, JSON.stringify(hash));
    }}
});
Object.seal(model);
Object.seal(model.key);
Object.seal(model.cat);

/******************************************************************************/

let controller = Object.create(null);
Object.defineProperties(controller, {
    init: { value: function() {
        model.init();
        let data = model.cat.select(0);
        view.init(data.fields);
        this.refresh(0);
    }},
    reset: { value: function() {
        let data = view.form.state();
        if (data.show) controller.toggle();
        localStorage.clear()
        controller.init();
    }},

    refresh: { value: function(id) {
        let data = model.cat.select(id);
        if (typeof data == "string") return view.message.view(data);
        else {
            view.view.view(data);
            view.form.view(data);
        }
        view.list.view(model.cat.list());
    }},
    toggle: { value: function() {
        let data = view.form.state(), key;
        if (data.show) {
            model.key.clear(data.id, data.key);
            view.form.toggle();
        } else if (key = model.key.fetch(data.id)) {
            view.form.toggle(key);
        } else {
            view.message.view("Failed to generate a key! Another user may be updating this cat.");
        }
    }},

    create: { value: function(data) {
        let res = model.cat.insert(data);
        this.toggle();
        if (typeof res == "string") {
            view.message.view(res);
            res = data.id;
        }
        this.refresh(res);
    }},
    click: { value: function(id) {
        let data = view.form.state();
        if (data.show) this.toggle();
        this.refresh(id);
    }},
    update: { value: function(data) {
        let res = model.cat.update(data);
        this.toggle();
        if (typeof res == "string") view.message.view(res);
        this.refresh(data.id);
    }},
    remove: { value: function(data) {
        let res = model.cat.remove(data);
        this.toggle();
        if (typeof res == "string") view.message.view(res);
        this.refresh(0);
    }},
    incrementCounter: { value: function(id) {
        let res = model.cat.incrementCount(id);
        if (res) view.message.view(res);
        this.refresh(id);
    }}
});
Object.seal(controller);

/******************************************************************************/

let view = Object.create(null);
Object.defineProperties(view, {
    message: { value: Object.create(null) },
    list: { value: Object.create(null) },
    view: { value: Object.create(null) },
    form: { value: Object.create(null) },

    init: { value: function(fields) {
        this.message.init();
        this.list.init();
        this.view.init(fields);
        this.form.init(fields);
    }}
});
Object.defineProperties(view.message, {
    timeout: { value: 10 * 1000 }, // 10 seconds
    timer: {
        value: 0,
        writable: true
    },
    links: { value: Object.create(null) },

    init: { value: function() {
        this.links.msg = document.getElementById("msg");
    }},

    view: { value: function(str) {
        this.clear();
        this.links.msg.appendChild(document.createTextNode(str));
        this.timer = setTimeout(view.message.clear, this.timeout);
    }},
    clear: { value: function() {
        if (!view.message.timer) return;
        clearTimeout(view.message.timer);
        view.message.timer = 0;
        view.message.links.msg.innerHTML = "";
    }}
});
Object.defineProperties(view.list, {
    links: { value: Object.create(null) },

    init: { value: function() {
        this.links.list = document.getElementById("menu");
    }},

    view: { value: function(data) {
        this.links.list.innerHTML = "";
        data.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0).forEach(el=>{
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(el.name));
            li.addEventListener("click", ev=>{
                ev = ev || window.event;
                let target = ev.target || ev.srcElement, last = document.getElementsByClassName("selected");
                if (last.length) last[0].classList.remove("selected");
                target.classList.add("selected");
                controller.click(el.id);
            });
            if (view.form.links.id.value == el.id) li.classList.add("selected");
            this.links.list.appendChild(li);
        });
    }}
});
Object.defineProperties(view.view, {
    timer: {
        value: 0,
        writable: true
    },
    img: {
        value: 1,
        writable: true
    },
    links: { value: Object.create(null) },

    init: { value: function(fields) {
        fields.forEach(f=>{
            if (f == "image") {
                this.links["image1"] = document.getElementById("view-image1");
                this.links["image-1"] = document.getElementById("view-image-1");
            } else this.links[f] = document.getElementById("view-" + f);
        });
        this.links["image1"].addEventListener("click", ()=>controller.incrementCounter(
            document.getElementById("form-id").value
        ));
        this.links["image-1"].addEventListener("click", ()=>controller.incrementCounter(
            document.getElementById("form-id").value
        ));
    }},

    view: { value: function(data) {
        data.fields.forEach(f=>{
            if (f == "image") {
                clearTimeout(this.timer);

                let oldImg = "image" + this.img;
                this.img*= -1;

                this.links["image" + this.img].src = data[f];

                this.links[oldImg].style.opacity = 0;
                this.links["image" + this.img].style.opacity = 1;

                this.timer = setTimeout(()=>this.links[oldImg].src="", 200);
            } else this.links[f].textContent = data[f];
        });
    }}
});
Object.defineProperties(view.form, {
    show: {
        value: false,
        writable: true
    },
    timeout: { value: model.key.expire },
    timer: {
        value: 0,
        writable: true
    },
    links: { value: Object.create(null) },

    init: { value: function(fields) {
        this.links.id = document.getElementById("form-id");
        this.links.key = document.getElementById("form-key");
        fields.forEach(f=>this.links[f] = document.getElementById("form-" + f));

        document.getElementById("edit").addEventListener("click", controller.toggle);
        document.getElementById("btn-new").addEventListener("click", ()=>{
            let data = { id: this.links.id.value, key: this.links.key.value };
            fields.forEach(f=>data[f] = this.links[f].value);
            controller.create(data);
        });
        document.getElementById("btn-save").addEventListener("click", ()=>{
            let data = { id: this.links.id.value, key: this.links.key.value };
            fields.forEach(f=>{
                if (this.links[f].value !== "") data[f] = this.links[f].value;
            });
            controller.update(data);
        });
        document.getElementById("btn-cancel").addEventListener("click", ()=>{
            fields.forEach(f=>this.links[f].value = "");
            controller.toggle();
        });
        document.getElementById("btn-delete").addEventListener("click", ()=>{
            controller.remove({ id: this.links.id.value, key: this.links.key.value });
        });
        document.getElementById("btn-reset").addEventListener("click", controller.reset);
    }},

    state: { value: function() {
        return {
            id: this.links.id.value,
            key: this.links.key.value,
            show: this.show
        };
    }},
    toggle: { value: function(key) {
        if (this.show) {
            this.show = false;
            clearTimeout(this.timer);
            this.links.key.value = "";
            document.getElementById("left").style.zIndex = "0";
            document.getElementById("left").style.opacity = "0";
            document.getElementById("right").style.zIndex = "1";
            document.getElementById("right").style.opacity = "1";
        } else {
            this.show = true;
            this.links.key.value = key;
            document.getElementById("left").style.zIndex = "1";
            document.getElementById("left").style.opacity = "1";
            document.getElementById("right").style.zIndex = "0";
            document.getElementById("right").style.opacity = "0.2";
            this.timer = setTimeout(controller.toggle, view.form.timeout);
        }
    }},

    view: { value: function(data) {
        this.links.id.value = data.id;
        data.fields.forEach(f=>{
            this.links[f].value = "";
            this.links[f].placeholder = data[f];
        });
    }}
});
Object.seal(view);
Object.seal(view.message);
Object.seal(view.list);
Object.seal(view.view);
Object.seal(view.form);
