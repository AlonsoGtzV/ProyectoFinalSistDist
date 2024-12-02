from flask import Flask, request, Response # type: ignore
from spyne import Application, rpc, ServiceBase, Integer, Unicode, Iterable # type: ignore
from spyne.protocol.soap import Soap11 # type: ignore
from spyne.server.wsgi import WsgiApplication # type: ignore
from database import fetch_user_by_id, insert_userr

app = Flask(__name__)


class UserService(ServiceBase):
    @rpc(Integer, _returns=Iterable(Unicode))
    def GetUser(ctx, id):
        """Regresa la informacion del User en la BD"""
        user = fetch_user_by_id(id)
        if user:
            yield f"ID: {user['id']}"
            yield f"Username: {user['username']}"
            yield f"Level: {user['level']}"
            yield f"Powerlevel: {user['powerlevel']}"
            yield f"Card ID: {user['cardId'] or 'None'}"
        else:
            yield "User NOTFOUND"

    @rpc(Unicode, Integer, Integer, Unicode, _returns=Unicode)
    def PostUser(ctx, username, level, powerlevel, card_id=None):
        """Añade un nuevo usuario a la BD"""
        new_id = insert_userr(username, level, powerlevel, card_id)
        return f"User '{username}' with ID {new_id} added successfully."


soap_app = Application(
    [UserService],
    tns="user.soap.api",
    in_protocol=Soap11(validator="lxml"),
    out_protocol=Soap11(),
)

# Conectar Spyne con Flask
wsgi_app = WsgiApplication(soap_app)

@app.route("/soap", methods=["POST"])
def soap_endpoint():
    # Pasar la solicitud al servidor SOAP de Spyne
    environ = request.environ.copy()
    environ["wsgi.input"] = request.stream
    environ["CONTENT_LENGTH"] = request.content_length or "0"

    # Crear una lista para capturar la respuesta
    response_body = []

    # Función de ayuda para capturar la respuesta WSGI
    def start_response(status, headers, exc_info=None):
        response_body.append((status, headers))

    # Procesar la solicitud WSGI
    response_data = wsgi_app(environ, start_response)
    
    # Extraer estado y encabezados
    status, headers = response_body[0]
    
    # Crear la respuesta Flask
    return Response(
        response_data,
        status=int(status.split(" ")[0]),
        headers=dict(headers),
        content_type="text/xml; charset=utf-8"
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)