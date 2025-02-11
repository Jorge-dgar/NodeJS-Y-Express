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
    # Actualizamos los paquetes
    sudo apt update && sudo apt upgrade -y

    # Instalamos dependencias necesarias
    sudo apt install -y curl nano

    # Instalamos Node.js y npm
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs

    # Creamos la carpeta node-app dentro de /home/vagrant
    mkdir -p /home/vagrant/node-app
    cd /home/vagrant/node-app

    # Iniciamos un proyecto Node.js
    npm init -y

    # Instalamos Express
    npm install express

    # Copiamos los archivos del proyecto desde /vagrant a /home/vagrant/node-app
    sudo cp /vagrant/server.js /home/vagrant/node-app/
    sudo cp /vagrant/server-cluster.js /home/vagrant/node-app/
    sudo cp /vagrant/ecosystem.config.js /home/vagrant/node-app/

    # Instalamos loadtest globalmente
    sudo npm install -g loadtest

    # Instalamos y configuramos PM2
    sudo npm install -g pm2
    pm2 start /home/vagrant/node-app/server.js -i 0
    pm2 save
    pm2 startup systemd

    # Mensaje final
    echo "Configuración completada. Puedes acceder a la aplicación en http://192.168.56.10:3000"
  SCRIPT
end
