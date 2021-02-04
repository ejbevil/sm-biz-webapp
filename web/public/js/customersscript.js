function deleteCustomer(id) {

    var req = new XMLHttpRequest();
    req.open('POST', '/delete/' + id, true);
    req.send();
}


