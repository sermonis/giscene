// https://stackoverflow.com/a/9039885/1314762
export const isIOS = function () {

	return [

		'iPad Simulator',
		'iPhone Simulator',
		'iPod Simulator',
		'iPad',
		'iPhone',
		'iPod'

	].includes( navigator.platform )

	// iPad on iOS 13 detection
	|| ( navigator.userAgent.includes( 'Mac' ) && 'ontouchend' in document );

};
