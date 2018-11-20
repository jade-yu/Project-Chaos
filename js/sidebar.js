var openSidebar = true;
var active = 0;

$(document).ready(function(){
    toggleSidebar(0);
    $('#backButton').addClass('hide');

    $('#settings').click(function () {
        toggleSidebar(0);
    });

    $('#align').click(function () {
        alignPlanets();
    });

    $('#random').click(function () {
        randomizePlanets();
    });

    $('#rotationSpeed').val(1).on('input', function() { 
        initValues($(this).val());
    });

    $('#scale').val(globalScale).on('input', function() {
        changeScale($(this).val());
    });

    $('#toggleInfoBox').click(function () {
        showInfoBox = !showInfoBox;
        toggleInfoBox();
    });

    $('#toggleOrbit').click(function () {
        showOrbit = !showOrbit;
        toggleOrbit();
    });

    $('#realScale').click(function () {
        realScale = !realScale;
        if(realScale) {
            $('#realScale').val('Realistic Scaling ON');
        } else {
            $('#realScale').val('Realistic Scaling OFF');
        }
        changeScale($('#scale').val());
    });

    $('#resetCamera').click(function () {
        initCamera();
    });

    for(var i = 0 ; i < celestialBodies.length ; i++) {
        addInfoBox(i);
    }
});

function toggleSidebar(id) {
    if(!openSidebar) {
        $('.sidebar').sidebar().trigger('sidebar:open');
        openSidebar = true;
        active = id;

        $('.sidebarButton').removeClass('close');
        $('.sidebarIcon').removeClass('close');
        $('.sidebarButton').addClass('open');
        $('.sidebarIcon').addClass('open');

        $('.sidebarButton').addClass('active');
    } else if(openSidebar && active != id) {
        // for additional sidebar buttons
    } else {
        $('.sidebar').sidebar().trigger('sidebar:close');
        openSidebar = false;

        $('.sidebarButton').removeClass('open');
        $('.sidebarIcon').removeClass('open');
        $('.sidebarButton').addClass('close');
        $('.sidebarIcon').addClass('close');

        $('.sidebarButton').removeClass('active');
    }
}

function toggleControls() {
    $('#align').prop('disabled', zoomedIn);
    $('#random').prop('disabled', zoomedIn);
    $('#scale').prop('disabled', zoomedIn);
    $('#toggleInfoBox').prop('disabled', zoomedIn);
    $('#toggleOrbit').prop('disabled', zoomedIn);
    $('#realScale').prop('disabled', zoomedIn);
    $('#resetCamera').prop('disabled', zoomedIn);
}

function addInfoBox(id) {
    var infoBoxIcon = document.createElement('div');
    $(infoBoxIcon).addClass('infoBoxIcon');

    var infoBoxLabel = document.createElement('div');
    $(infoBoxLabel).addClass('infoBoxLabel').text(names[id].charAt(0).toUpperCase() + names[id].substr(1).toLowerCase());

    var infoBox = document.createElement('div');
    $(infoBox).addClass('infoBox');
    $(infoBox).attr("id", names[id]);
    $(infoBox).append(infoBoxIcon);
    $(infoBox).append(infoBoxLabel);

    $('body').append(infoBox);

    $('#' + names[id]).click(function () {
        showInfo(id);
    });
}