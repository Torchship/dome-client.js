export const config = {
  node: {
    mode: "production",
    // do you want your webclient to allow users to connect to any game => true
    // do you want your webclient to connect users only to your game => false
    connectAnywhere: false,

    // if you set this to port 80, you must run the server as root
    port: 5000,

    // specific ip is optional (if your server has more than one)
    //    'ip'           : '208.52.189.89',

    socketUrl: "http://localhost:5000",
    socketUrlSSL: "",
    poweredBy: "dome-client.js",
    session: {
      secret: "secret",
      key: "express.sid",
    },
  },

  // ssl is optional
  //  'ssl' : {
  //    'port' : 443,
  //    'key'  : 'config/ssl/BlahBlah.key',
  //    'cert' : 'config/ssl/BlahBlah.crt',
  //    'ca'   : 'config/ssl/intermediate.crt'
  //  },

  // where it connects to
  moo: {
    name: "Torchship",
    host: "moo.torchship.org",
    port: 7777,
  },

  // specialized autocomplete for each player class
  autocomplete: {
    p: "config/ac/player.txt",
  },
  version: {
    major: "1",
    minor: "2",
    // build is pulled from git hash
  },
};

export default config;