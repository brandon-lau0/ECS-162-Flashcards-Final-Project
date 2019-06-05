var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

///////////////////////////////////////////////////////////////////////////////
//                          welcome to my messy code                         //
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
//                                   Common                                  //
///////////////////////////////////////////////////////////////////////////////
var TopButton = function (_React$Component) {
  _inherits(TopButton, _React$Component);

  // PROPS should contain the button text and an onClick function
  function TopButton(props) {
    _classCallCheck(this, TopButton);

    return _possibleConstructorReturn(this, (TopButton.__proto__ || Object.getPrototypeOf(TopButton)).call(this, props));
  }

  _createClass(TopButton, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "button",
        {
          id: this.props.id,
          className: "helvetica white-fg dark-purple-bg",
          onClick: this.props.onClick
        },
        this.props.text
      );
    }
  }]);

  return TopButton;
}(React.Component);

/*
 * Component for the top part of the screen (title + button).
 * No updates needed for this one.
 */


var TitleBar = function (_React$Component2) {
  _inherits(TitleBar, _React$Component2);

  // PROPS should contain buttonText, onClick, and horizontal padding class
  function TitleBar(props) {
    _classCallCheck(this, TitleBar);

    return _possibleConstructorReturn(this, (TitleBar.__proto__ || Object.getPrototypeOf(TitleBar)).call(this, props));
  }

  _createClass(TitleBar, [{
    key: "render",
    value: function render() {
      return (
        // since the padding changes between views
        React.createElement(
          "section",
          { className: "titlebar " + this.props.paddingClass },
          React.createElement(
            "div",
            { className: "titlebar-format" },
            React.createElement(TopButton, {
              id: this.props.buttonId,
              text: this.props.buttonText,
              onClick: this.props.buttonOnClick
            })
          ),
          React.createElement(
            "h3",
            { className: "raleway dark-purple-fg" },
            "Lango!"
          ),
          React.createElement("div", { className: "titlebar-format" })
        )
      );
    }
  }]);

  return TitleBar;
}(React.Component);

/*
 * Component for the username bar at the bottom.
 */


var UsernameBar = function (_React$Component3) {
  _inherits(UsernameBar, _React$Component3);

  function UsernameBar(props) {
    _classCallCheck(this, UsernameBar);

    var _this3 = _possibleConstructorReturn(this, (UsernameBar.__proto__ || Object.getPrototypeOf(UsernameBar)).call(this, props));

    _this3.state = { username: "Username" };
    return _this3;
  }

  _createClass(UsernameBar, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this4 = this;

      var request = new XMLHttpRequest();
      request.open("GET", "/username", true);

      request.onload = function () {
        var response = JSON.parse(request.responseText);
        _this4.setState({ username: response.username });
      };

      request.onerror = function () {
        alert("There was an error with requesting user information.");
      };

      request.send();
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(
        "aside",
        { className: "user-add helvetica white-fg dark-purple-bg" },
        React.createElement(
          "div",
          null,
          this.state.username
        )
      );
    }
  }]);

  return UsernameBar;
}(React.Component);

///////////////////////////////////////////////////////////////////////////////
//                               Addition Page                                //
///////////////////////////////////////////////////////////////////////////////
/*
 * Requests the translation of TEXT, then calls CALLBACK with the
 * translation as the sole parameter.
 */


function requestTranslation(text, callback) {
  var request = new XMLHttpRequest();
  request.open("GET", "/translate?english=" + text, true);

  request.onload = function () {
    return callback(JSON.parse(request.responseText).Chinese);
  };
  request.onerror = function () {
    return alert("There was an error with the translation request.");
  };

  request.send();
}

/*
 * Requests to save a card with EN English text and TL translation
 * text to the database.
 */
function saveCard(en, tl) {
  var request = new XMLHttpRequest();
  request.open("POST", "/store?english=" + en + "&chinese=" + tl, true);

  request.onerror = function () {
    return alert("There was an error with saving the card.");
  };

  request.send();
}

/*
 * Component for the English input and translation output cards with
 * button. Two items in one component.
 *
 * We could've extracted the button into a separate component, but
 * I decided it would be too much effort, even though that would give
 * us less React/CSS duplication and cleaner code.
 */

var CreationCards = function (_React$Component4) {
  _inherits(CreationCards, _React$Component4);

  function CreationCards(props) {
    _classCallCheck(this, CreationCards);

    var _this5 = _possibleConstructorReturn(this, (CreationCards.__proto__ || Object.getPrototypeOf(CreationCards)).call(this, props));

    _this5.onKeyDown = function (event) {
      if (event.key == "Enter") {
        var input = document.getElementById(_this5.props.inputId).value;

        event.preventDefault();
        requestTranslation(input.trim(), function (translation) {
          _this5.setState({ tlText: translation });
        });
      }
    };

    _this5.onKeyUp = function (_) {
      _this5.setState({ inputStyle: _this5.inputStyle() });

      // it's okay to modify value, since it's not managed by react
      if (document.getElementById(_this5.props.inputId).value == "") {
        _this5.setState({ tlText: "" });
      }
    };

    _this5.onClick = function () {
      console.log(_this5.props);
      var en = document.getElementById(_this5.props.inputId).value;
      var tl = document.getElementById(_this5.props.outputId).innerText;

      // trim tl just in case
      saveCard(en.trim(), tl.trim());

      document.getElementById(_this5.props.inputId).value = "";
      _this5.setState({ tlText: "" });
    };

    _this5.state = { inputStyle: _this5.inputStyle(), tlText: undefined };
    return _this5;
  }

  _createClass(CreationCards, [{
    key: "render",
    value: function render() {
      var inputElement = document.getElementById(this.props.inputId);
      var input = inputElement && inputElement.value;
      // show grey if no input
      var tlColor = input && this.state.tlText ? "black-fg" : "grey-fg";

      return [
      // we could've used a wrapper instead of an array, but it's too late now
      React.createElement(
        "section",
        { key: "0", className: "card-add" },
        React.createElement(
          "figure",
          { className: "card-add" },
          React.createElement("textarea", {
            id: this.props.inputId,
            className: "helvetica",
            type: "text",
            placeholder: "English",
            onKeyDown: this.onKeyDown,
            onKeyUp: this.onKeyUp,
            style: this.state.inputStyle
          })
        ),
        React.createElement(
          "figure",
          { className: "card-add" },
          React.createElement(
            "span",
            { id: this.props.outputId, className: "helvetica " + tlColor },
            this.state.tlText || "Translation"
          )
        )
      ), React.createElement(
        "div",
        { key: "1", className: "save-button" },
        React.createElement(
          "button",
          {
            className: "action-button helvetica white-fg green-bg",
            onClick: this.onClick
          },
          "Save"
        )
      )];
    }

    /*
     * Generates the inline styling for the input text.
     */

  }, {
    key: "inputStyle",
    value: function inputStyle() {
      var inputElement = document.getElementById(this.props.inputId);
      var inputStyle = { boxSizing: "border-box" };
      var dummy = void 0;

      if (inputElement) {
        dummy = inputElement.cloneNode();
        dummy.value = inputElement.value;

        dummy.style.width = window.getComputedStyle(inputElement).width;
      } else {
        dummy = document.createElement("textarea");
        dummy.value = "branny";

        dummy.id = this.props.inputId; // same as what the input card would have
        dummy.classList.add("helvetica");
      }

      dummy.style.height = "1px";
      dummy.style.visibility = "hidden";

      document.body.appendChild(dummy);

      inputStyle.height = dummy.scrollHeight;

      document.body.removeChild(dummy);

      return inputStyle;
    }

    /*
     * Watches for when the user presses RET and makes the translation
     * request accordingly.
     */


    /*
     * Watches for a key press and resizes the input box accordingly.
     */


    /*
     * Makes a request to save the card.
     */

  }]);

  return CreationCards;
}(React.Component);

///////////////////////////////////////////////////////////////////////////////
//                                Review Page                                //
///////////////////////////////////////////////////////////////////////////////
// NOTE: because some of this is third-party code, any code related to
// reviewing will be generally unclean and monkey-patched because I
// don't have the time to actually look through and understand what
// the hell the example is doing.

/*
 * React component for the front of the card.
 * https://reactjsexample.com/react-flipping-card-with-tutorial/
 */


var ReviewCardFront = function (_React$Component5) {
  _inherits(ReviewCardFront, _React$Component5);

  function ReviewCardFront(props) {
    _classCallCheck(this, ReviewCardFront);

    return _possibleConstructorReturn(this, (ReviewCardFront.__proto__ || Object.getPrototypeOf(ReviewCardFront)).call(this, props));
  }

  _createClass(ReviewCardFront, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "card-side side-front" },
        React.createElement(
          "div",
          { className: "flip-icon" },
          React.createElement("img", { src: "assets/refresh.png" })
        ),
        React.createElement(
          "div",
          { className: "card-side-container" },
          React.createElement(
            "h2",
            { id: "trans" },
            this.props.text
          )
        )
      );
    }
  }]);

  return ReviewCardFront;
}(React.Component);

/*
 * React component for the green correct box.
 */


var ReviewCorrect = function (_React$Component6) {
  _inherits(ReviewCorrect, _React$Component6);

  function ReviewCorrect(props) {
    _classCallCheck(this, ReviewCorrect);

    return _possibleConstructorReturn(this, (ReviewCorrect.__proto__ || Object.getPrototypeOf(ReviewCorrect)).call(this, props));
  }

  _createClass(ReviewCorrect, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "review-correct helvetica" },
        React.createElement(
          "span",
          null,
          "CORRECT!"
        )
      );
    }
  }]);

  return ReviewCorrect;
}(React.Component);
/*
 * React component for the back side of the card.
 * https://reactjsexample.com/react-flipping-card-with-tutorial/
 */


var ReviewCardBack = function (_React$Component7) {
  _inherits(ReviewCardBack, _React$Component7);

  function ReviewCardBack(props) {
    _classCallCheck(this, ReviewCardBack);

    return _possibleConstructorReturn(this, (ReviewCardBack.__proto__ || Object.getPrototypeOf(ReviewCardBack)).call(this, props));
  }

  _createClass(ReviewCardBack, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "card-side side-back" },
        React.createElement(
          "div",
          { className: "flip-icon" },
          React.createElement("img", { src: "assets/refresh.png" })
        ),
        React.createElement(
          "div",
          { className: "card-side-container" },
          this.props.correct ? React.createElement(ReviewCorrect, null) : React.createElement(
            "h2",
            { id: "congrats" },
            this.props.text
          )
        )
      );
    }
  }]);

  return ReviewCardBack;
}(React.Component);

/*
 * React component for the overall review card.
 * https://reactjsexample.com/react-flipping-card-with-tutorial/
 */


var ReviewCard = function (_React$Component8) {
  _inherits(ReviewCard, _React$Component8);

  function ReviewCard(props) {
    _classCallCheck(this, ReviewCard);

    return _possibleConstructorReturn(this, (ReviewCard.__proto__ || Object.getPrototypeOf(ReviewCard)).call(this, props));
  }

  _createClass(ReviewCard, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        {
          className: "helvetica card-container " + (this.props.flipped ? "card-container-flip" : "")
        },
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(ReviewCardBack, {
            text: this.props.backText,
            correct: this.props.correct
          }),
          React.createElement(ReviewCardFront, { text: this.props.frontText })
        )
      );
    }
  }]);

  return ReviewCard;
}(React.Component);

/*
 * Component for review cards + button.
 * This could be a mini god-object I swear.
 */


var ReviewCards = function (_React$Component9) {
  _inherits(ReviewCards, _React$Component9);

  // PROPS should contain textId and inputId
  function ReviewCards(props) {
    _classCallCheck(this, ReviewCards);

    var _this10 = _possibleConstructorReturn(this, (ReviewCards.__proto__ || Object.getPrototypeOf(ReviewCards)).call(this, props));

    _this10.onKeyDown = function (event) {
      if (event.key == "Enter") {
        event.preventDefault();
        _this10.maybeFlip();
      }
    };

    _this10.cardOnClick = function () {
      _this10.maybeFlip();
    };

    _this10.buttonOnClick = function () {
      if (_this10.state.flipped) {
        _this10.requestCard();
        document.getElementById(_this10.props.inputId).value = "";
      } else {
        alert("Flip the card first!");
      }
    };

    _this10.state = { card: undefined, flipped: false };
    return _this10;
  }

  _createClass(ReviewCards, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.requestCard();
    }
  }, {
    key: "render",
    value: function render() {
      // There's absolutely no point in using the given CardTextarea
      // because it's literally just a textarea. If anything, it'll
      // be a headache.
      return React.createElement(
        "section",
        { className: "card-review" },
        React.createElement(
          "div",
          { id: "flip-card", onClick: this.cardOnClick },
          React.createElement(ReviewCard, {
            frontText: this.state.card && this.state.card.translatedText || "",
            backText: this.state.card && this.state.flipped && this.state.card.englishText || "",
            correct: this.correct(),
            flipped: this.state.flipped
          })
        ),
        React.createElement(
          "figure",
          { className: "card-review" },
          React.createElement("textarea", {
            // scrolls by default
            id: this.props.inputId,
            className: "helvetica",
            type: "text",
            placeholder: "Translation",
            onKeyDown: this.onKeyDown,
            required: true
          })
        ),
        React.createElement(
          "div",
          { className: "next-button" },
          React.createElement(
            "button",
            {
              className: "action-button helvetica white-fg green-bg",
              onClick: this.buttonOnClick
            },
            "Next"
          )
        )
      );
    }

    /*
     * Requests a card from the server.
     */

  }, {
    key: "requestCard",
    value: function requestCard() {
      var _this11 = this;

      var request = new XMLHttpRequest();
      request.open("GET", "/getcard", true);
      request.onload = function () {
        var response = JSON.parse(request.responseText);
        _this11.setState({ card: response, flipped: false });
      };
      request.onerror = function () {
        return alert("There was an error requesting a card.");
      };
      request.send();
    }

    /*
     * Lazy name. Checks if the user input is correct.
     */

  }, {
    key: "correct",
    value: function correct() {
      var inputElement = document.getElementById(this.props.inputId);
      return inputElement && this.state.card && this.state.card.englishText == inputElement.value.trim();
    }

    /*
     * Sends the answer result to the server.
     */

  }, {
    key: "sendResult",
    value: function sendResult() {
      var request = new XMLHttpRequest();
      request.open("POST", "/putresult?unique_identifier=" + this.state.card.unique_identifier + "&result=" + this.correct(), true);
      request.onload = function () {
        return undefined;
      };
      request.onerror = function () {
        return alert("There was an error sending the result.");
      };
      request.send();
    }

    /*
     * Flips the card and sends whether the user got the answer correct
     * to the server. Nothing happens if the card was already flipped.
     */

  }, {
    key: "maybeFlip",
    value: function maybeFlip() {
      if (!this.state.flipped) {
        this.setState({ flipped: true });
        this.sendResult();
      }
    }
  }]);

  return ReviewCards;
}(React.Component);

///////////////////////////////////////////////////////////////////////////////
//                                   Final                                   //
///////////////////////////////////////////////////////////////////////////////
/*
 * Component for the entire creation screen.
 */


var MainScreen = function (_React$Component10) {
  _inherits(MainScreen, _React$Component10);

  function MainScreen(props) {
    _classCallCheck(this, MainScreen);

    var _this12 = _possibleConstructorReturn(this, (MainScreen.__proto__ || Object.getPrototypeOf(MainScreen)).call(this, props));

    _this12.buttonOnClick = function () {
      _this12.setState({ reviewing: !_this12.state.reviewing });
    };

    _this12.state = { reviewing: false };
    // this.state = { reviewing: true };
    return _this12;
  }

  _createClass(MainScreen, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this13 = this;

      var request = new XMLHttpRequest();
      request.open("GET", "/hascard", true);

      request.onload = function () {
        var response = JSON.parse(request.responseText);
        _this13.setState({ reviewing: response.hasCard });
      };
      request.onerror = function () {
        return alert("There was an error contacting the server.");
      };

      request.send();
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.reviewing == undefined) {
        return React.createElement("main", null);
      }

      return React.createElement(
        "main",
        null,
        React.createElement(TitleBar, {
          buttonId: this.state.reviewing ? "add-button" : "review-button",
          buttonText: this.state.reviewing ? "Add" : "Start Review",
          buttonOnClick: this.buttonOnClick,
          paddingClass: this.state.reviewing ? "titlebar-review-padding" : "titlebar-add-padding"
        }),
        this.state.reviewing ?
        // textId isn't actually used anymore since we have the third-party component
        React.createElement(ReviewCards, { textId: "card-tl-review", inputId: "card-en-review" }) : React.createElement(CreationCards, { inputId: "card-en-add", outputId: "card-tl-add" }),
        React.createElement(UsernameBar, { username: "Branny Buddy" })
      );
    }
  }]);

  return MainScreen;
}(React.Component);

ReactDOM.render(React.createElement(MainScreen, null), document.getElementById("root"));