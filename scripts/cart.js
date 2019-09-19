'use strict';

var CART_ADD_ICON_SVG =
		'<svg role="img" class="icon" aria-hidden="true" viewbox="0 0 24 24">' +
			'<title>Add to cart</title>' +
			'<use href="images/icons/cart_add.svg#icon" xlink:href="images/icons/cart_add.svg#icon" />' +
		'</svg>',
	CART_REMOVE_ICON_SVG =
		'<svg role="img" class="icon" aria-hidden="true" viewbox="0 0 24 24">' +
			'<title>Remove from cart</title>' +
			'<use href="images/icons/cart_remove.svg#icon" xlink:href="images/icons/cart_remove.svg#icon" />' +
		'</svg>';

var cartItems = [];

window.addEventListener('load', function () {
	var cartCard = document.getElementById('cart-card');
	
	cartItems.elem = document.getElementById('cart-list');
	
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

function addToCart(addedItem) {
	addItemToAlphabetizedList(addedItem, addedItem.originalList, cartItems);
	
	addedItem.actionBtn.innerHTML = CART_REMOVE_ICON_SVG;
	addedItem.actionBtn.onclick = () => removeFromCart(addedItem);
}

function removeFromCart(removedItem) {
	addItemToAlphabetizedList(removedItem, cartItems, removedItem.originalList);
	
	removedItem.actionBtn.innerHTML = CART_ADD_ICON_SVG;
	removedItem.actionBtn.onclick = () => addToCart(removedItem);
}

function addItemToAlphabetizedList(addedItem, oldList, newList) {
	var itemBefore,
		itemBeforeIndex;
	newList.forEach((item, i) => {
		if (item.name.toLowerCase() < addedItem.name.toLowerCase()) {
			itemBefore = item;
			itemBeforeIndex = i;
		}
	});
	
	// Remove the item from its current list.
	addedItem.elem.parentElement.removeChild(addedItem.elem);
	oldList.splice(oldList.indexOf(addedItem), 1);
	
	if (!itemBefore) {
		if (newList.elem.childElementCount > 0) {
			// If there are no items before it, add it at the start.
			newList.elem.insertBefore(addedItem.elem, newList.elem.firstElementChild);
			newList.unshift(addedItem);
		} else {
			// If there was nothing else on the list add it.
			newList.elem.appendChild(addedItem.elem);
			newList.push(addedItem);
		}
	} else {
		// Add it at the appropriate point in the new list.
		itemBefore.elem.parentElement.insertBefore(addedItem.elem, itemBefore.elem.nextElementSibling);
		newList.splice(itemBeforeIndex + 1, 0, addedItem);
	}
}
