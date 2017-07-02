var fts = null;
var ats = null;

$(document).ready(function () {
    $.ajax({
        url: 'https://openfooddata.github.io/vocab/foodtype/foodtype.jsonld',
        cache: true,
        headers: {
            Accept: "application/ld+json"
        },
        success: function (response) {
            fts = response;
            dofoodtype();
        }
    });

    $.ajax({
        url: 'https://openfooddata.github.io/vocab/actortype/actortype.jsonld',
        cache: true,
        headers: {
            Accept: "application/ld+json"
        },
        success: function (response) {
            ats = response;
            doactortype();
            dorelatedContext();
        }
    });
    addImgInNoLogo();
    dorelatedActor();
});

function addImgInNoLogo() {
    var el = document.querySelector('.thumbnail');
    if(el.getAttribute('src') == '') {
        var jsonld = JSON.parse(
            document.querySelector(
                'script[type="application/ld+json"]').innerText);
        if(jsonld["schema:image"][0])
        {
            el.src = jsonld["schema:image"][0];
        }
    }
}

function doactortype() {
    document.querySelectorAll('.actortype').forEach(function (el) {
        var uri = getOFDatUri(el.innerText);
        el.href = uri;
        if(ats == null) {
            setNameUri(uri, el)
        } else {
            setName(ats, el, uri);
        }
    });
}

function dofoodtype() {
    document.querySelectorAll('.foodtype').forEach(function (el) {
        var uri = getOFDftUri(el.innerText);
        el.href = uri;
        if(fts == null) {
            setNameUri(uri, el)
        } else {
            setName(fts, el, uri);
        }
    });
}

function dorelatedContext() {
    document.querySelectorAll('.relatedContext').forEach(function (el) {
        var uri = getOFDatUri(el.innerText);
        if(ats == null) {
            setNameUri(uri, el)
        } else {
            setName(ats, el, uri);
        }
    });
}

function dorelatedActor() {
    document.querySelectorAll('.relatedActor').forEach(function (el) {
        var uri = el.innerText;
        if(ats == null) {
            setActorName(el, uri)
        }
    });
}

function setActorName(el, uri) {
    $.ajax({
        url: uri,
        cache: true,
        headers: {
            Accept: "application/ld+json"
        },
        success: function (response) {
            response['@graph'].filter(function (obj) {
                    return obj['@id'] == el.innerText || obj['@id'] == uri;
                }
            ).forEach(function (obj) {
                if(obj.name) {
                    el.innerText = obj.name;
                } else {
                    el.innerText = uri.replace("https://w3id.org/openfooddata/actors/","");
                }
            });
        }
    });
}

function setNameUri(uri, el) {
    $.ajax({
        url: uri,
        cache: true,
        headers: {
            Accept: "application/ld+json"
        },
        success: function (response) {
            setName(response, el, uri);
        }
    });
}

function setName(response, el, uri) {
    response['@graph'].filter(function (obj) {
            return obj['@id'] == el.innerText || obj['@id'] == uri;
        }
    ).forEach(function (obj) {
        el.innerText = getLabel(obj);
    });

}

function getLabel(obj) {
    var result = null;
    if (Object.prototype.toString.call(obj.prefLabel) === '[object Array]') {
        obj.prefLabel.forEach(function (lbl) {
            if (lbl['@language'] == 'en') {
                result = lbl['@value'];
                return;
            }
            ;
        });
    } else {
        result = obj.prefLabel['@value'];
    }
    return result;
}
function getOFDatUri(curie) {
    return curie.replace('at:', 'https://w3id.org/openfooddata/vocab/actortype#');
}
function getOFDftUri(curie) {
    return curie.replace('ft:', 'https://w3id.org/openfooddata/vocab/foodtype#');
}