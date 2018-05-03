
 declare let sails: any;

module.exports = {

	test: (req,res) => {
        let data = req.body;
        sails.log.debug('test');
        res.send('test');
	}

};
