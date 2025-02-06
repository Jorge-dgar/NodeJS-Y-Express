# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Define la caja base
  config.vm.box = "debian/bullseye64"

  # Configura el reenvío de puertos
  config.vm.network "forwarded_port", guest: 3000, host: 8080


  # Configura una IP fija en la red privada
  config.vm.network "private_network", ip: "192.168.56.10"

  # Configuración de la máquina virtual
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"  # Asigna memoria a la VM
  end

  config.vm.provision "shell", privileged: false, inline: <<-SCRIPT
  #Actualizamos los paquetes
  sudo apt update && sudo apt upgrade -y

  #Instala Node.js y npm. Añadimos el repositorio oficial de Node.js:
  sudo apt-get install curl
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt install -y nodejs

  #Creamos la carpeta sin cluster
  mkdir node-app && cd node-app
  sudo cp -v /home/vagrant/node-app /vagrant

  #Iniciamos un proyecto Node.js
  npm init -y

  #Instalamos Express
  npm install express

  #Creamos el archivo server.js
  nano server.js
  sudo cp -v /home/vagrant/node-app/server.js /vagrant

  #Ejecutamos la aplicación
  node server.js

  #Ahora creamos la aplicación con cluster
  nano server-cluster.js
  sudo cp -v /home/vagrant/node-app/server-cluster.js /vagrant

  #Ahora hacemos las pruebas de rendimiento con loadtest
  sudo npm install -g loadtest

  #Ejecutamos pruebas de carga sin cluster:
  loadtest http://localhost:3000/api/500000 -n 1000 -c 100

  #Ejecutamos pruebas de carga con cluster:
  loadtest http://localhost:3000/api/500000 -n 1000 -c 100


  #Administración con PM2
  sudo npm install -g pm2

  #Ejecutamos la aplicación y comprobamos los procesos:
  pm2 start server.js -i 0
  pm2 ls
  pm2 logs
  pm2 monit

  #Finalmente detenemos la aplicación
  pm2 stop server.js


  #Creamos el archivo ecosystem para cambios específicos
  pm2 ecosystem
  sudo cp -v /home/vagrant/node-app/ecosystem.config.js

  #Una vez editado el archivo lo ejecutamos y ya si queremos podemos comprobar y jugar con el archivo con los siguientes comandos:
  # $ pm2 start nombre_aplicacion
  # $ pm2 restart nombre_aplicacion
  # $ pm2 reload nombre_aplicacion
  # $ pm2 stop nombre_aplicacion
  # $ pm2 delete nombre_aplicacion

  pm2 start ecosystem.config.js


















  SCRIPT
end