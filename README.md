Remote jGallery
===============

This little script help manage ajax-loaded galleries with full-screen support.

*Note: Readme is not yet completed. Please be patient.*

Basic Setup
-----------

To use this plugin a little of setup is required.

* First of all you need a page that will return your gallery list in `JSONP`,
    you can see a simple example in `examples/remote-server.php`.    
    *Note: Of course this example of server-side implementation doesn't make
    much sense since we have a static array simply converted and returned as
    JSONP, in fact this plugin is probably more effective used with a database
    in the backend, but I've choosen to keep my examples as simple as possible.*

* Next you must include the javascript into your page and setup the minimal
    configuration:

    <script type="text/javascript" charset="utf-8" src="../remote-jgallery.jquery.js"></script>
    <script type="text/javascript">
    jQuery(window).ready(function($) {
      jQuery().remotejGallery({
        remoteURL: "http://example.com/jgallery-remote-server.php",
        wrapperID: "remote-jgallery-container"
      });
    });
    </script>
    
* As last thing you need an empty html container where your gallery gallery
    will be built:

    <div id="remote-jgallery-container"></div>


That's all the basic configuration you need to make it work, naturally you'll probably want some customization, in this case please check the section **Plugin Documentation** of this document.



Plugin Documentation
--------------------

In this section all the options of this plugin are explained in detail.