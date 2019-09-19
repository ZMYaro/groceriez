'use strict';

window.addEventListener('load', function () {
	var cartCard = document.getElementById('cart-card');
	
	// Set up cart panel button for narrow windows.
	document.getElementById('cart-btn').addEventListener('click', function () {
		cartCard.classList.add('open');
	});
	
	// Prevent pointer down on card closing the cart card.
	cartCard.addEventListener('pointerdown', function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
	});
	
	// Close the cart card on pointer down outside the card.
	document.body.addEventListener('pointerdown', function (ev) {
		if (cartCard.classList.contains('open')) {
			cartCard.classList.remove('open');
		}
	});
}, false);