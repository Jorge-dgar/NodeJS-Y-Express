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
    sudo cp -r /vagrant/node-app/* /home/vagrant/node-app/

    # Instalamos herramientas necesarias
    sudo npm install -g loadtest pm2

    # Cargar PM2 en el path
    export PATH=$PATH:/home/vagrant/.npm-global/bin

    # Iniciar aplicaciones con PM2 usando ecosystem.config.js
    pm2 start /home/vagrant/node-app/ecosystem.config.js

    # Guardar configuración de PM2
    pm2 save
    pm2 startup systemd

    # Esperar que PM2 inicie correctamente
    sleep 5

    # Verificar que la aplicación responde antes de hacer pruebas de carga
    if curl -s http://localhost:3000 > /dev/null; then
        echo "La aplicación está en ejecución, procediendo con las pruebas de carga."
    else
        echo "ERROR: La aplicación no está corriendo correctamente. Verifica PM2."
        pm2 logs server-cluster
        exit 1
    fi

    # Ejecutar pruebas de carga
    echo "Ejecutando prueba sin clúster..."
    loadtest http://localhost:3000/api/500000 -n 1000 -c 100

    echo "Ejecutando prueba con clúster..."
    loadtest http://localhost:3000/api/500000 -n 1000 -c 100

    # Mensaje final
    echo "Configuración completada. Puedes acceder a la aplicación en http://192.168.56.10:3000"
  SCRIPT
end
