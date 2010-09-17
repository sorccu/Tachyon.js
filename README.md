# Tachyon.js

Tachyon.js is a simple, stand-alone implementation of [Subspace: Secure Cross-Domain Communication for Web Mashups](http://www2007.org/program/paper.php?id=801).

## Setting up

Subspace relies on subdomains and `<iframe>`s. The paper (linked above) contains
all the details, but here's the basic setup:

1. Your main app. We will call this the "top frame"
    * `document.domain`: admin.example.org
2. An iframe in your top frame. This is called the "mediator frame"
    * `document.domain`: admin.example.org
        * Can access the top frame
3. An iframe in your mediator frame. This is the "untrusted frame"
    * `document.domain`: untrusted.example.org
        * Cannot access the top frame or the mediator frame

Here's what follows:

1. The top frame creates a Subspace instance
2. The mediator frame accesses the top frame to create another Subspace instance
    * `self.Tachyon = parent.Tachyon.createSubspace();`
    * Both instances have access to the same "mediator objects" that are used to pass data around
3. The mediator frame strips the subdomain from its `document.domain`
    * `document.domain = 'example.org';`
        * The top frame and the mediator frame no longer have the same domain
            * They can no longer access each other
            * But they still have their own Subspace instances, which refer to the same mediator objects
4. The untrusted frame strips the subdomain from its `document.domain` as well
    * `document.domain = 'example.org';`
        * Still cannot access the top frame
        * Can now access the mediator frame

So, the untrusted frame gains access to the mediator frame's Subspace instance. The untrusted frame and the top frame can then communicate with each other in both directions using their respective Subspace instances.

## Usage

### Interacting with the top frame from the untrusted frame

#### In the top frame

    Tachyon.respond('label', function(data) {
      return 'response from top frame';
    });

#### In the untrusted frame

    // parent refers to the mediator frame
    parent.Tachyon.request('label', { param: 'value' }, function(response) {
      alert('The top frame responded with: ' + response);
    });

### Interacting with the untrusted frame from the top frame

#### In the untrusted frame

    // parent refers to the mediator frame
    parent.Tachyon.respond('label', function(data) {
      return 'response from untrusted frame';
    });

#### In the top frame

    Tachyon.request('label', { param: 'value' }, function(response) {
      alert('The untrusted frame responded with: ' + response);
    });

## Credits

### For the research

* Collin Jackson (Stanford University)
* Helen Wang (Microsoft)

### For the (independent) implementation

Simo Kinnunen