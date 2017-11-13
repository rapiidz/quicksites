const FAVICON_GETTER = "https://s2.googleusercontent.com/s2/favicons?domain_url=";
var longClickedSiteId;
var longClickTimer; 

$(document).ready(function () {

    /* Om det finns sparade sidor - ladda in dem med fetchSites funktionen */
    if (localStorage.getItem('sites')) {
        fetchSites();
    }

    /* --------------- Event Listeners  --------------- */

    $('#addSiteModalAddBtn').click(function () {
        let urlInpVal = $('#addSiteModalUrlInp').val();
        if (urlInpVal) {
            saveSite('', '', urlInpVal);
        }
    });

    $('#siteActionsModalEditBtn').click(function () {
        hideSiteActionsModal();
        initSitePropModal();
    });

    $('#siteActionsModalRemoveBtn').click(function () {
        removeSite(longClickedSiteId);
        hideSiteActionsModal();
    });

    $('#sitePropModalSaveBtn').click(function () {
        let nameInpVal = $('#sitePropModalFormNameInp').val();
        let iconInpVal = $('#sitePropModalFormIconUrlInp').val();
        let urlInpVal = $('#sitePropModalFormUrlInp').val();

        if (nameInpVal && urlInpVal) {
            updateSite(nameInpVal, iconInpVal, urlInpVal);
        }
    });

    /* Quick add sites */
    $('#sugSitesFacebook').on('click', function () {
        saveSite('Facebook', 'resources/images/icon_site_facebook.png', 'https://www.facebook.com')
    });
    $('#sugSitesGoogle').on('click', function () {
        saveSite('Google', 'resources/images/icon_site_google.png', 'https://www.google.com')
    });
    $('#sugSitesTwitter').on('click', function () {
        saveSite('Twitter', 'resources/images/icon_site_twitter.png', 'https://twitter.com')
    });
    $('#sugSitesYoutube').on('click', function () {
        saveSite('YouTube', 'resources/images/icon_site_youtube.png', 'https://www.youtube.com')
    });

    /* Site long click listener */
    $(document).on('mousedown touchstart', '.tile-i', function (e) {
        var target = $(e.currentTarget);
        longClickTimer = window.setTimeout(function () {
            longClickedSiteId = target.attr('id');
            showSiteActionsModal();
        }, 600);
    }).on('mouseup touchend', function (e) {
        clearTimeout(longClickTimer);
    });

    /* --------------- Functions --------------- */

    function saveSite(name, icon, url) {
        // Om URLn inte har protokoll ( http:// eller https:// ) då lägg till det
        if (url.indexOf('https://') == -1 && url.indexOf('http://') == -1) {
            url = 'http://' + url;
        }

        let siteId = randId();
        let siteUrl = url;
        let siteIcon = icon ? icon : FAVICON_GETTER + siteUrl;
        let siteName = name ? name : getSiteName(siteUrl);

        var site = {
            id: siteId,
            url: siteUrl,
            icon: siteIcon,
            name: siteName
        }

        if (localStorage.getItem('sites') === null) {
            let sites = [];
            sites.push(site);
            localStorage.setItem('sites', JSON.stringify(sites));
        } else {
            let sites = JSON.parse(localStorage.getItem('sites'));
            sites.push(site);
            localStorage.setItem('sites', JSON.stringify(sites));
        }

        fetchSites();
        hideAddSiteModal();
    }

    function updateSite(name, icon, url) {
        // Om URLn inte har protokoll ( http:// eller https:// ) då lägg till det
        if (url.indexOf('https://') == -1 && url.indexOf('http://') == -1) {
            url = 'http://' + url;
        }

        let sites = JSON.parse(localStorage.getItem('sites'));

        for (let i = 0; i < sites.length; i++) {
            if (sites[i].id == longClickedSiteId) {
                sites[i].name  = name;
                sites[i].url = url;
                if (icon) {
                    sites[i].icon = icon;
                }
            }
        }

        localStorage.setItem('sites', JSON.stringify(sites));
        fetchSites();
        hideSitePropModal();
    }

    function removeSite(id) {
        let sites = JSON.parse(localStorage.getItem('sites'));

        for (let i = 0; i < sites.length; i++) {
            if (sites[i].id == id) {
                sites.splice(i, 1);
            }
        }

        localStorage.setItem('sites', JSON.stringify(sites));
        fetchSites();
    }

    function fetchSites() {
        let sites = JSON.parse(localStorage.getItem('sites'));
        let container = document.getElementById('tileContainer');
        container.innerHTML = '';

        for (let i = 0; i < sites.length; i++) {
            container.insertAdjacentHTML('beforeend',
                '<div class="tile-i" id="' + sites[i].id + '" data-url="' + sites[i].url + '" onclick="openSite(\'' + sites[i].url + '\')">' +
                '<div class="tile-img" style="background-image: url(\'' + sites[i].icon + '\');"></div>' +
                '<span class="tile-title">' + sites[i].name + '</span>' +
                '</div>');
        }

        container.insertAdjacentHTML('beforeend',
            '<div class="tile" id="addSiteTile" data-toggle="modal" data-target="#addSiteModal">' +
            '<div class="tile-img" style="background-image: url(\'resources/images/icon_add_white.png\');"></div>' +
            '<span class="tile-title" style="text-transform: none;">Add a site</span>' +
            '</div>');

    }

    function initSitePropModal() {
        let name = $('#sitePropModalFormNameInp');
        let url = $('#sitePropModalFormUrlInp');

        let sites = JSON.parse(localStorage.getItem('sites'));

        for (let i = 0; i < sites.length; i++) {
            if (sites[i].id == longClickedSiteId) {
                name.val(sites[i].name);
                url.val(sites[i].url);
            }
        }

        $('#sitePropModal').modal('show');
    }

    function getSiteName(url) {
        if (url.indexOf('http://') >= 0) {
            url = url.replace('http://', '');
        }

        if (url.indexOf('https://') >= 0) {
            url = url.replace('https://', '');
        }

        if (url.indexOf('www.') >= 0) {
            url = url.replace('www.', '');
        }

        let res = url.split(".");
        let name = res[0];

        return name[0].toUpperCase() + name.slice(1);
    }

    function randId() {
        return Math.random().toString(36).substr(2, 10);
    }

    function showSiteActionsModal() {
        $('#siteActionsModal').modal('show');
    }

    function hideSiteActionsModal() {
        $('#siteActionsModal').modal('hide');
    }

    function showSitePropModal() {
        $('#sitePropModal').modal('show');
    }

    function hideSitePropModal() {
        document.getElementById('sitePropModalForm').reset();
        $('#sitePropModal').modal('hide');
    }

    function hideAddSiteModal() {
        document.getElementById('addSiteModalForm').reset();
        $('#addSiteModal').modal('hide');
    }

});

function openSite(url) {
    window.location.href = url;
}