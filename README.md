## **README.md - Despliegue de una aplicación en cluster con Node.js y PM2**  

### **1️⃣ Introducción**  
En esta práctica, implementamos una aplicación **Node.js con Express** y la optimizamos usando **cluster** y **PM2** para mejorar su rendimiento en sistemas multinúcleo.  
También realizamos pruebas de carga con **loadtest** para comparar el rendimiento con y sin clustering.  

---

## **2️⃣ Configuración del entorno con Vagrant**  

### **Requisitos previos**  
Asegúrate de tener instalado:  
- [Vagrant](https://www.vagrantup.com/)  
- [VirtualBox](https://www.virtualbox.org/)  

### **Pasos para crear la máquina virtual**  
1️⃣ Crea un directorio de trabajo y accede a él:  
```sh
mkdir node-cluster-vagrant
cd node-cluster-vagrant
```
2️⃣ Crea el archivo **Vagrantfile** dentro del directorio y copia el siguiente código:  

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "debian/bullseye64"
  config.vm.network "forwarded_port", guest: 3000, host: 8080
  config.vm.network "private_network", ip: "192.168.56.10"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end
  config.vm.provision "shell", privileged: false, inline: <<-SCRIPT
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl nano
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    mkdir -p /home/vagrant/node-app
    cd /home/vagrant/node-app
    npm init -y
    npm install express
    cp /vagrant/server.js /home/vagrant/node-app/
    cp /vagrant/server-cluster.js /home/vagrant/node-app/
    cp /vagrant/ecosystem.config.js /home/vagrant/node-app/
    sudo npm install -g loadtest
    sudo npm install -g pm2
    pm2 start /home/vagrant/node-app/server.js -i 0
    pm2 save
    pm2 startup systemd
    echo "Configuración completada. Accede a http://192.168.56.10:3000"
  SCRIPT
end
```

3️⃣ Inicia la máquina virtual:  
```sh
vagrant up
```
📸 **Captura: Instalación de Node.js** 

![Instalacion nodejs](https://github.com/user-attachments/assets/6e2daf7d-2777-4ca9-ba10-bd014766aea2)

---

## **3️⃣ Creación de la aplicación Node.js**  

4️⃣ Conéctate a la máquina virtual:  
```sh
vagrant ssh
```
5️⃣ Accede al directorio del proyecto y crea `server.js`:  
```sh
cd /home/vagrant/node-app
nano server.js
```
✏️ Copia el siguiente código:  
```js
const express = require("express");
const app = express();
const port = 3000;
const limit = 5000000000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/:n", function (req, res) {
  let n = parseInt(req.params.n);
  let count = 0;
  if (n > limit) n = limit;
  for (let i = 0; i <= n; i++) {
    count += i;
  }
  res.send(`Final count is ${count}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
```
📸 **Captura: Iniciamos proyecto Node.js**

![iniciamos proyecto node js](https://github.com/user-attachments/assets/3f4e6fd5-31b2-4dbb-bbae-fdee14870d88)

📸 **Captura: Instalamos Express** (imagenes/instalamos-express.png)  

![instalamos express](https://github.com/user-attachments/assets/97855d6c-4d12-413f-bdf8-ea30f5e72f8d)

---

## **4️⃣ Pruebas de conexión y despliegue**  

6️⃣ Ejecuta la aplicación:  
```sh
node server.js
```
📸 **Captura: Aplicación escuchando en el puerto 3000** 

![la aplicacion desplegada se escucha en el puerto 3000](https://github.com/user-attachments/assets/338c62bd-0196-4294-b143-84201205242a)

7️⃣ Abre un navegador y accede a:  
```
http://192.168.56.10:3000
```
📸 **Captura: Comprobación en el navegador (puerto 8080 y 3000)**

![comprobacion en internet con puerto 8080](https://github.com/user-attachments/assets/c077888d-3c27-4f0b-99f9-fcc3fdaf2d10)
![otra prueba en red](https://github.com/user-attachments/assets/0e265665-3746-402d-82fd-5c8b05feb654)
![prueba 3 en el navegador](https://github.com/user-attachments/assets/47acf226-a6c2-4f46-863d-e81055816c48)


---

## **5️⃣ Implementación de Clustering**  

8️⃣ Crea `server-cluster.js`:  
```sh
nano server-cluster.js
```
✏️ Copia el siguiente código:  
```js
const express = require("express");
const cluster = require("cluster");
const os = require("os");
const port = 3000;
const totalCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Number of CPUs: ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died, creating a new one.`);
    cluster.fork();
  });
} else {
  const app = express();
  console.log(`Worker ${process.pid} started`);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    let count = 0;
    for (let i = 0; i <= n; i++) {
      count += i;
    }
    res.send(`Final count is ${count}`);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}
```
📸 **Captura: Creamos aplicación con cluster**

![creamos app con cluster](https://github.com/user-attachments/assets/2ed71a76-6efe-422c-9e9a-b11e3f33885c)

---

## **6️⃣ Pruebas de rendimiento con LoadTest**  

9️⃣ Instala y ejecuta pruebas de carga:  
```sh
loadtest http://localhost:3000/api/500000 -n 1000 -c 100
```
![instalamos loadtest para las pruebas de rendimientp](https://github.com/user-attachments/assets/d5a931c4-30cd-4a4d-8470-31af200e0770)

📸 **Captura: Prueba sin cluster**

![prueba de rendimiento sin cluster](https://github.com/user-attachments/assets/2fdafa8c-0e71-462a-bfd1-6106467c588e)

📸 **Captura: Prueba con cluster** 

![prueba de rendimiento con cluster](https://github.com/user-attachments/assets/5aef25a6-1524-4b80-aa4b-64dc4e055eae)

---

## **7️⃣ Administración con PM2**  

🔟 Inicia PM2:  
```sh
pm2 start server.js -i 0
pm2 ls
pm2 logs
pm2 monit
```
📸 **Captura: PM2 logs y procesos**

![pm2 logs](https://github.com/user-attachments/assets/23d295ec-968f-470f-b627-f6a944e26d58)
![pm2 ls](https://github.com/user-attachments/assets/1a6aca65-b9e9-4f24-b42b-5a11b08d777d)
![pm2 monit](https://github.com/user-attachments/assets/e5e8321b-2ee0-4fc7-802c-0972eb0da326)

![comprobamos los procesos de la app 1](https://github.com/user-attachments/assets/5f2545ed-f34e-44d9-9aab-507f39191da7)
![comprobamos los procesos de la app 2](https://github.com/user-attachments/assets/5649d790-b7ee-4bba-a047-f92beb1ad0ed)
![archivo ecosystem editado ok](https://github.com/user-attachments/assets/59bfb4df-5dfa-4f48-8631-b4d7a85e0501)
![resultados de ecosystem tras editarlo](https://github.com/user-attachments/assets/9d29e927-5ea1-47ff-bd81-9c59fc12f88b)


1️⃣1️⃣ Detenemos la aplicación:  
```sh
pm2 stop server.js
```
📸 **Captura: Deteniendo aplicación**

![paramos la aplicación](https://github.com/user-attachments/assets/3f561a0e-68be-48ae-a387-2a0bc42e35c1)
