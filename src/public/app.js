/**
 *
 * Author -> Holy Makroghop Mark
 *        - <@Makroghop>
 *
 *
 */

(function (global, factory) {
  // check to see if we are on a browser or other runtime environments
  let _self =
    typeof global !== "undefined" && typeof global === "object" ? global : {};

  // call this function as a callback with the "global" variable as an argument
  return factory(_self);
})(this, (s) => {
  /* App will be added as a key to the window object globally
   */
  s.App = s.App || {};

  // somehow like JQuery for selection
  s.App.$ = (e) => {
    return typeof e === "string" && e ? document.querySelector(e) : e;
  };

  // set the navigation bar
  App.setMenu = () => {
    let isPressed = false;
    let menu__toggle = s.App.$("#menu__toggle");
    let nav__list = App.$(".nav__list");

    // show the menu on toggle button click
    menu__toggle.addEventListener("click", (e) => {
      event.stopPropagation();
      if (!isPressed) {
        nav__list.style.transform = "translateY(14%)";
        isPressed = true;
      } else {
        nav__list.style.transform = "translateY(160%)";
        isPressed = false;
      }
    });

    // remove menu when the body is clicked
    window.addEventListener("click", (e) => {
      nav__list.style.transform = "translateY(160%)";
      isPressed = false;
    });
  };

  // OOOOO -Initialize the App- OOOOO
  App.init = () => {
    App.setMenu();
  };
});

// App starter
window.addEventListener("load", () => {
  App.init();
});
