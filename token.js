
import fetch from 'node-fetch';
export default class Token {

    static instances = [];

    last;
    resToken;

    constructor() {
        this.last = 0;
        this.resToken = '';
    }

    async getToken(url) {
        let now = Date.now();
      console.log(now - this.last > 60 * 30 * 1000)
        if (now - this.last > 60 * 30 * 1000) {
            let res = await fetch(url, {
                mode: 'cors',
            });
            this.resToken = await res.json();
            this.last = now;
            return this.resToken;
        } else {
            return this.resToken;
        }
    }

    static getInstance(key) {
       
        if (!Token.instances[key]) {
         
            Token.instances[key] = new Token();
        }
        return Token.instances[key];
    }
}


