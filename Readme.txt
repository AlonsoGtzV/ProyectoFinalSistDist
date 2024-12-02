DokkanAPI
Propósito de las APIS
La api REST está programada con node.js y simula un juego de cartas llamado Dokkan, donde cada usuario tiene distintas cartas de personajes con distintas estadisticas.

La api SOAP está programada en python y simula un registro de entrenadores con solo 4 campos: id, username, nivel, nivel de poder y la ID de su carta Insignia, que es el atributo a linkear con la api REST

La api REST incluye comunicación hacia la api SOAP en dos endpoints: GetByID y PostUser
Requisitos Previos
Asegúrate de tener instalados los siguientes programas en tu sistema antes de comenzar:

Git: Para clonar el repositorio.
Node.js y npm: Para instalar dependencias y ejecutar el backend.
Docker y Docker Compose: Para orquestar los contenedores del proyecto desde docker.
Minikube y kubectl: Para orquestar los contenedores del proyecto desde kubernetes.
Instalación y Configuración
Clona este repositorio en el directorio de tu preferencia:

git clone https://github.com/AlonsoGtzV/ProyectoFinalSistDist.git
Cambia al directorio del proyecto:

cd ProyectoFinal
Iniciar minikube

minikube start
Haz los port forward para que puedas usar las imagenes localmemte:

kubectl port-forward --namespace kube-system service/registry 5000:80
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:host.docker.internal:5000"
Construye las imágenes para la api soap (users) y la api rest (Cartas) con el tag 10

docker build -t localhost:5000/dokkan-api:12 .
docker build -t localhost:5000/dokkan-rest-api:12 .
Haz un docker push para que las imagenes estén disponibles para minikube:

docker push localhost:5000/dokkan-api:12
docker push localhost:5000/dokkkan-rest-api:12
Aplica todos los archivos yml:

kubectl create namespace agv-api  
kubectl create namespace eaqv-database
kubectl apply -f pv/
kubectl apply -f deployments/

Consulta la dirección IP externa que tiene el servicio de la Rest Api para conectarse con el LoadBalancer:

kubectl get svc -n agv-api
Inicia el minikube tunnel

minikube tunnel     
Deberás ingresar a tu navegador en la ruta 'ExternalIP':3000/swaggerIndex, y desde ahi podrás probar todos los endpoints de la api Rest

Para probar la api rest con docker-compose
Levantar los contenedores

docker-compose up -d --build
Después de esperar 5 minutos para que mysql empiece, consultar los endpoint en localhost:3000/swaggerIndex

Apagar los contenedores y borrar los volumenes e imagenes creadas localmente:

docker-compose down --rmi local -v
