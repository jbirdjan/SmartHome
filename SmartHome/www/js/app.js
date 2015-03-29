/*global Image: false, document: false, intel: false, localStorage: false, $: false, console: false */


(function () {
    "use strict";
    
    function isDeviceSecured(device) {
        //if device has an instanceID associated with a secureData object then device is secured
        if (device.instanceID !== null) {
            return true;
        }
        return false;
    }
    
    //test if url is a vaild device
    function isValidIP(url, success, failure) {
        $("<img>", {
            src: url,
            error: failure,
            load: success
        });
    }
	/**********************************************************************************************/
    //"devicesList" is an array which contains information on the devices currently in the application,
    //its stored in localStorage.
    //instanceID - secureData instanceID, if device is not secured then this will be null.
    //deviceID - id for the device, used as the key in the "devicesList" array.
    //device - the device we add
    /**********************************************************************************************/
    function addDeviceToDeviceList(deviceID, device) {
        var devices = JSON.parse(localStorage.getItem('devicesList'));
        devices[deviceID] = device;
        addDeviceToStorageIdList(deviceID, device);
        localStorage.setItem('devicesList', JSON.stringify(devices));
    }
    
	/**********************************************************************************************/
    //this function adds an device to the application listview
    /**********************************************************************************************/
    function addDeviceToListView(deviceName, device) {
        var list, listElem, deviceType;
        switch(device.type) {
            case "1":
                deviceType = "lock";
                break;
            case "2":
                deviceType = "blinds";
                break;
            default:
                alert("Not Valid Device Type" + device.type);
                return;
        }
        
        listElem = $('<li><a id="' + deviceName +
                        '" href="#' + deviceType + '_page_popup" data-position-to="window" data-rel="popup"' +
                         ' data-theme="b" class="list_elem ui-btn ui-btn-b" data-transition="slide" ' +
                         'data-position-to="window" data-direction="reverse"><h3> ' +
                                deviceName + '</h3></a></li>').hide();
        if (isDeviceSecured(device)) {
            listElem.find('a').addClass('ui-icon-lock ui-btn-icon-right');
        }
        listElem.click(function () {
            sock = new WebSocket("w://cycurity.cs.iastate.edu:8322
            switch(device.type) {
                case "1":
                    $('#device_text').hide();
                    $('#device_image').show();
                    $('#lock_door_button').show();
                    $('#unlock_door_button').show();
                    //set id and tags for the selected device
                    $('#device_name').text(deviceName);
                    //this is a text device so show the text element and hide the image element
                    //$('#device_text').show();
                    $('#device_image').hide();
                    //$('#device_text').val(device.device_text);
                    $('#lock_door_button').bind("click", function () {
                        $.ajax({
                            method: "POST",
                            url: "http://" + device.address + "/?action=lock"                         
                        }).done(function( data ) {
                            alert(deviceName + " is now locked");
                        }); 
                    });
                    $('#unlock_door_button').bind("click", function () {
                        $.ajax({
                            method: "POST",
                            url: "http://" + device.address + "/?action=unlock" 
                        }).done(function( data ) {
                            alert(deviceName + " is now unlocked");
                        });
                    });
                    /*if (!(isDeviceSecured(device))) {
                        alert(device.type);
                        //this is a text device so show the text element and hide the image element
                        //$('#device_text').show();
                        $('#device_image').hide();
                        //$('#device_text').val(device.device_text);
                        $('#lock_door_button').onclick(function () {
                            $.ajax({
                                method: "POST",
                                url: "http://" + device.address + "/?action=lock"                         
                            }).done(function( data ) {
                                alert(deviceName + "is now locked");
                            }); 
                        });
                        $('#unlock_door_button').onclick(function () {
                            $.ajax({
                                method: "POST",
                                url: "http://" + device.address + "/?action=unlock" 
                            }).done(function( data ) {
                                alert(deviceName + "is now unlocked");
                            });
                        });

                        $('#show_device_button').text("Secure");
                        $('#show_device_button').buttonMarkup({ icon: "lock" });
                    } else {
                        $('#device_image').attr('src', 'images/lock-it.png');
                        $('#show_device_button').text('Show');
                        $('#show_device_button').buttonMarkup({ icon: "eye" });
                    }*/
                    break;
            }
        });
        list = $('#device_list');
        list.append(listElem).listview('refresh');
        listElem.slideDown(350); //slide effect, delay of 350 ms.
    }
    
    /***********************************************************************************************/
    //"storageIdList" is an array which holds the collection of id's for all the existing secureStorage
    //objects, its used in the onDeviceReady event to read the secureStorage objects and create the 
    //"devicesList".
    //its stored in localStorage.
    //deviceID - the device id used as the key in storageIdList list and as the id for the secureStorage
    //object.
    //isImage - flag indication if the device is an image.
    /**********************************************************************************************/
    function addDeviceToStorageIdList(deviceID, device) {
        var devices, newDevice;
        devices = JSON.parse(localStorage.getItem('storageIdList'));
        newDevice = device;
        devices[deviceID] = newDevice;
        localStorage.setItem('storageIdList', JSON.stringify(devices));
    }
    
    /**************************************************************************/
    //clear the new device form from user data
    /**************************************************************************/
    function clearNewDevicePage() {
        $('#new_device_text').val('');
        $('#device_text').textinput('refresh');
        $('#new_device_id').val('');
        $('#new_device_tags').val('');
        $('#secure_device').val('on').slider("refresh");
    }
    
    /*******************************************************************************************/
    //this function reads the "storageIdList" and loads all the existing secureStorage objects,
    //it updates the "devicesList" with the read information and updates the application listview.
    /*******************************************************************************************/
    function loadDevicesFromStorage() {
        var storageIdList = JSON.parse(localStorage.getItem('storageIdList'));
        //go over each device existing in secureStorage and load it.
        $.each(storageIdList, function (deviceName, device) {
            alert(device.name);
            //here we read the secureStorage object corresponding to the given deviceID.               
            intel.security.secureStorage.read(function (instanceID) {
                //Success callback, the secureStorage object was read successfully.
                //a secureData object was created, now we get it's tag string.
                var newDevice = new Device(device.name, device.address, device.type);
                newDevice.setID(instanceID);
                //var newDevice = { 'instanceID': instanceID, 'device_tags': deviceTags, 'device_text': null, 'isImage': device.isImage };
                addDeviceToDeviceList(deviceName, newDevice);
                addDeviceToListView(deviceName, newDevice);
            }, fail, { 'id': deviceName });
        });
    }
    /****************************************************************************************/
    //create a new secure Device from the input data using Intel Security Services API.
    //deviceID - time id which is used for internal data structures.
    //deviceTags - tag string passed to the Intel Security Services API.
    //deviceData - the data we want to secure, either a plain-text or image url.
    /****************************************************************************************/
    function createNewSecureDevice(deviceName, device) {
        //secure the data by creating a secureData object, the data and tag string are passed
        //as parameters
        intel.security.secureData.createFromData(function (instanceID) {
            alert("here");
            //this is the success callback, a secureData object was created,
            //next we want to secure the object in secure storage.
            intel.security.secureStorage.writeSecureData(function () {
                //device is an image                                                          
                addDeviceToStorageIdList(instanceID, device);
                var newDevice = new Device(device.name, device.address, device.type);
                newDevice.setID(instanceID);
                //var newDevice = { 'instanceID': instanceID, 'device_tags': deviceTags, 'device_text': deviceData, 'isImage': true };
                addDeviceToDeviceList(deviceName, newDevice);
                addDeviceToListView(deviceName, newDevice);
                //this is the success callback, secureData object was stored in secure storage,
                //update the internal data structures and update the listview.
                /*isValidIP(device.address, function () {
                    //device is an image                                                          
                    addDeviceToStorageIdList(instanceID, device);
                    var newDevice = new Device(device.name, device.address, device.type);
                    newDevice.setID(instanceID);
					//var newDevice = { 'instanceID': instanceID, 'device_tags': deviceTags, 'device_text': deviceData, 'isImage': true };
                    addDeviceToDeviceList(deviceName, newDevice);
					addDeviceToListView(deviceName, newDevice);
                }, function () {
                    //device is plain-text
                    addDeviceToStorageIdList(deviceName, device);
                    var newDevice = new Device(device.name, device.address, device.type);
                    newDevice.setID(instanceID);
					//var newDevice = { 'instanceID': instanceID, 'device_tags': deviceTags, 'device_text': deviceData, 'isImage': false };
                    addDeviceToDeviceList(deviceName, newDevice);
					addDeviceToListView(deviceName, newDevice);
                });*/
            }, fail, { 'address': device.address, 'instanceID': instanceID });
        }, fail, { 'id': deviceName, 'type': device.type });
    }
    
    function Device(name, address, type) {
        this.setID = function(id) {
            this.instanceID = id;
        };
        this.name = name;
        this.address = address;
        this.type = type;
    }
	
	/**********************************************************************************************/
    //remove device from listView
    /**********************************************************************************************/
	function removeDeviceFromListView(deviceID) {
		$("#" + deviceID).parent().remove();
		$('#devices_list').listview('refresh');
	}
    
	/**********************************************************************************************/
    //single point of failure for all API calls in this sample, for more information on
    //the error object, consult with Intel Security Services API documentation.
    /**********************************************************************************************/
    function fail(errObj) {
		console.error('Error Code: ' + errObj.code + ' Error message: ' + errObj.message);
    }
	
    /**********************************************************************************************/
    //event handlers
    /**********************************************************************************************/
    function register_event_handlers() {
        $(document).on("click", "#connect_device", function (evt) {
            var deviceName, deviceIP, deviceType, devices, device;
			if ($('#new_device_name').val() === "") {
				$('#new_device_name').attr("placeholder", "Device Id field is required");
				return;
			}
			//if($('#new_device_id').val().indexOf(" ") > -1)
			//{
			//	$('#new_device_id').val("");
			//	$('#new_device_id').attr("placeholder", "Device Id can't contain spaces");
			//	return;
			//}
			deviceName = $('#new_device_name').val();
			if ($('#new_device_ip').val() === "") {
				$('#new_device_ip').attr("placeholder", "Device address is required");
				return;
			}
			deviceIP = $('#new_device_ip').val();
			if ($('#new_device_type').val() === '0') {
				$('#new_device_type').attr("placeholder", "Device type must be specified");
				return;
			}
            deviceType = $('#new_device_type').val();
			//if a device with the ip exists then dont add the new device.
			devices = JSON.parse(localStorage.getItem('devicesList'));
			if (deviceIP in devices) {
				$('#new_device_ip').val("");
				$('#new_device_ip').attr("placeholder", "Device exists in memory");
				return;
			}
			$('#new_device_popup').popup("close");
            if ($('#secure_device').val() === 'on') {
                device = new Device(deviceName, deviceIP, deviceType);
                createNewSecureDevice(deviceName, device);
                clearNewDevicePage();
            } else {
				//device is not secured
				if ($('#new_device_name').val() === "") {
					//no device data was provided so a device will not be created.
					return;
				}
                var newDevice = new Device(deviceName, deviceIP, deviceType);
                //var newDevice = { 'instanceID': null,
                //				'device_text': $('#new_device_text').val(), 'isImage': true};
                addDeviceToDeviceList(deviceName, newDevice);
                addDeviceToListView(deviceName, newDevice);
                clearNewDevicePage();
                /*isValidIP($('#new_device_ip').val(), function () {
                    var newDevice = new Device(deviceName, deviceIP, deviceType);
					//var newDevice = { 'instanceID': null,
					//				'device_text': $('#new_device_text').val(), 'isImage': true};
                    addDeviceToDeviceList(deviceName, newDevice);
					addDeviceToListView(deviceName, newDevice);
                    clearNewDevicePage();
                }, function () {
                    var newDevice = new Device(deviceName, deviceIP, deviceType);
					//var newDevice = { 'instanceID': null, 'device_tags': deviceTag,
					//				'device_text': $('#new_device_text').val(), 'isImage': false};
                    
                    addDeviceToDeviceList(deviceName, newDevice);
					addDeviceToListView(deviceName, newDevice);
                    clearNewDevicePage();
                });*/
            }
        });

        /***************************************************************************************/
        //callback code for the show device button
        /***************************************************************************************/
        $(document).on("click", "#show_device_button", function (evt) {
            var deviceID = $('#device_name').text();
            var devices = JSON.parse(localStorage.getItem('devicesList'));
            var device = devices[deviceID];
            if (!(isDeviceSecured(device))) {
                delete devices[deviceID];
                localStorage.setItem('devicesList', JSON.stringify(devices));
                createNewSecureDevice(deviceID, device);
                $('#device_page_popup').popup("close");
                removeDeviceFromListView(deviceID);
            } else if ($('#show_device_button').text() === 'Show') {
                //extract the data from the secure data object using the corresponding instanceID           
                intel.security.secureData.getData(function (deviceData) {
                    //successfully extracted the data, we can now show it to the user
					$('#show_device_button').text('Show');
                    if (device.isImage === true) {
                        $('#device_image').attr('src', deviceData);
                    } else {
                        //device is a text device
                        $('#device_text').show();
                        $('#device_image').hide();
                        $('#device_text').val(deviceData);
                        $('#device_text').textinput('refresh');
                    }
                    //set button to close                                                            
                    $('#show_device_button').buttonMarkup({ icon: 'back'});
                    $('#show_device_button').text('Close');
                }, fail, device.instanceID);
            } else {
                //button is close
                $('#show_device_button').text('Show');
                $('#device_page_popup').popup('close');
            }
        });
    }

    /**************************************************************************/

    function onDeviceReady() {
        //empty the listview
        var devicesList, list = $('#devices_list');
        list.empty();
        //clear the devicesList from all secured devices, those devices will 
        //be reloaded from secureStorage. Add to the listView the unsecure devices.
		//the reason for this is that secure devices are read from secure storage and new 
		//secureData objects are created
        if ('devicesList' in localStorage) { 
            devicesList = JSON.parse(localStorage.getItem('devicesList'));
            $.each(devicesList, function (deviceName, device) {
                if (isDeviceSecured(device)) {
                    delete devicesList[deviceName];
                } else {
                    addDeviceToListView(deviceName, device);
                }
            });
            localStorage.setItem('devicesList', JSON.stringify(devicesList));
        } else {
            //there is no devicesList, create a new one.
            devicesList = {};
            localStorage.setItem('devicesList', JSON.stringify(devicesList));
        }

        localStorage.setItem('devicesList', '{}');
        //if this is the first time the app loads then load default devices.
        //and create the storageIdList
        if (!('storageIdList' in localStorage)) {
            var storageIdList = {};
            localStorage.setItem('storageIdList', JSON.stringify(storageIdList));
        } else {
            //load all device stored in secure storage and update the listView
            //with the loaded devices.
            loadDevicesFromStorage();
        }
        //add event callbacks
        $("#device_page_popup").bind({
            popupafterclose: function (event, ui) {
                $('#show_device_button').show();
                $('#show_device_button').text('Show');
                $('#device_text').val('');
                $('#device_image').attr('src', 'images/lock-it.png');
            }
        });
		
        //swipe delete event callback
        $(document).on("swipeleft swiperight", ".list_elem", function (event) {
            var deviceID = $(this).attr('id');
            $("#confirm").popup("open");
            $("#confirm #yes").on("click", function () {
				removeDeviceFromListView(deviceID);
                var devicesList = JSON.parse(localStorage.getItem("devicesList"));
                var storageIdList = JSON.parse(localStorage.getItem("storageIdList"));
                //if device is in secure storage remove secureStorage object.
                if (deviceID in storageIdList) {
                    var storageID = deviceID;
                    //the secureStorage device is deleted, the id of the device we want removed is the parameter.
                    //we provide no Success callback, null is passed.
					
                    intel.security.secureStorage.delete(null, fail, { 'id': storageID });
                    delete storageIdList[deviceID];
                    localStorage.setItem('storageIdList', JSON.stringify(storageIdList));
                }
                //check if devicesList holds the device (should be always true) and check that device is secured.
                if (deviceID in devicesList) {
					if (isDeviceSecured(devicesList[deviceID])) {
						var instanceID = devicesList[deviceID].instanceID;
						//the secureData device is destroyed, the instanceID for the device we want removed is the parameter.
						//we provide no Success callback, null is passed.
						intel.security.secureData.destroy(null, fail, instanceID);
					}
					delete devicesList[deviceID];
					localStorage.setItem('devicesList', JSON.stringify(devicesList));
				}
                $("#confirm #yes").off();
            });
            $("#confirm #cancel").on("click", function () {
                $("#confirm #cancel").off();
            });
        });
    }
	
    $(function () {
        document.addEventListener("deviceready", onDeviceReady, false);
    });
    
    /*********************************************************************************************/
    //function loads default devices, so if the app loads for the first time it is not empty.
    /*********************************************************************************************/
    /*function loadDefaultDevices() {
        createNewSecureDevice('Social_media', 'password private', '12345678');
        createNewSecureDevice('e-mail', 'password private', 'this-is-my-email-password');
        createNewSecureDevice('Bank', 'password private', 'abcdef');
        convertImgToBase64('images/photo-01.jpg', function (base64Img) {
            createNewSecureDevice('Camping', 'image public', base64Img);
        });
        convertImgToBase64('images/photo-02.jpg', function (base64Img) {
            createNewSecureDevice('Kids_1', 'image private', base64Img);
        });
        convertImgToBase64('images/photo-03.jpg', function (base64Img) {
            createNewSecureDevice('Kids_2', 'image private', base64Img);
        });
        //create one default unsecured device
        convertImgToBase64('images/photo-04.jpg', function (base64Img) {
			var deviceID = 'My_tablet';
			var newDevice = { 'instanceID': null, 'device_tags': 'image public',
									'device_text': base64Img, 'isImage': true};
			addDeviceToDevicesList(deviceID, newDevice);
			addDeviceToListView(deviceID, newDevice);
        });
    }*/
	
    /*********************************************************************************************/
    //filter function implementation, if device is to be filtered out a true value will be returned. 
    /*********************************************************************************************/
 /*   $.mobile.document.one("filterablecreate", "#device_list", function () {
        $("#device_list").filterable("option", "filterCallback", function (index, searchValue) {
            if (searchValue === "") {
                return false;
            }
            var searchTags = searchValue.toLowerCase().split(" ");
            var elementTags = $(this).find('p').contents().text().toLowerCase().split(" ");
			var searchTagsFound  = searchTags.every(function(val) { return elementTags.indexOf(val) >= 0; });
			if (searchTagsFound === true)
			{
				return false; //show device
			}
			return true; //filter device out
        });
    });*/
	
    /*function convertImgToBase64(url, callback) {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var img = new Image();
        img.onload = function () {
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL('image/png');
            callback.call(this, dataURL);
            canvas = null;
        };
        img.src = url;
    }*/

	
    $(document).ready( function() {
        new Oauth2()
        register_event_handlers();
    });
        
}());