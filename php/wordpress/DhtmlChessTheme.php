<?php

/**
 * Created by IntelliJ IDEA.
 * User: alfmagne1
 * Date: 17/04/2017
 * Time: 12:48
 */
class DhtmlChessTheme
{


    const CATEGORY_BOARD = "Board";
    const CATEGORY_LABELS = "Labels";
    const CATEGORY_BORDER = "Border";
    const CATEGORY_NOTATIONS = "Notations";
    const CATEGORY_ARROWS = "Arrows";

    /**
     * @var array
     */
    private $fields;


    private static $bgPath = "[DOCROOT]images/board-bg/";
    private static $piecePath = "[DOCROOT]images/";
    private static $squareBg = "[DOCROOT]images/board/";
    private static $imgNone = "[DOCROOT]images/none.png";


    private static $squareBgs;

    public function __construct()
    {
        self::$squareBgs = array(
            self::$imgNone,
            self::$squareBg . "lightest-wood.png",
            self::$squareBg . "lighter-wood.png",
            self::$squareBg . "light-wood.png",
            self::$squareBg . "light-wood2.png",
            self::$squareBg . "light-grey-wood.png",
            self::$squareBg . "wood-1.png",
            self::$squareBg . "wood4.png",
            self::$squareBg . "wood5.png",
            self::$squareBg . "wood6.png",
            self::$squareBg . "wood7.png",
            self::$squareBg . "wood8.png",
            self::$squareBg . "wood-2.png",
            self::$squareBg . "dark-wood.png",
            self::$squareBg . "dark-wood-2.png",
            self::$squareBg . "grey-wood.png",
            self::$squareBg . "wood-bamboo.png",
            self::$squareBg . "wood-cherry.png",
            self::$squareBg . "darker-wood.png",
            self::$squareBg . "red-wood2.png",
            self::$squareBg . "light-blue-wood-2.png",
            self::$squareBg . "dark-blue-wood-2.png",
        );
    }

    public function categoryFields($category){
        $fields = $this->getFields();
        $ret = array();
        foreach($fields as $field){
            if($field["c"] == $category){
                $ret[] = $field;
            }
        }
        return $ret;
    }

    public function fieldByIndex($index)
    {
        $fields = $this->getFields();
        return $fields[$index];
    }

    public function getFields()
    {
        if (empty($this->fields)) {
            $fields = $this->borderFields();
            $fields = array_merge($fields, $this->boardFields());
            $fields = array_merge($fields, $this->labelFields());
            $fields = array_merge($fields, $this->arrowFields());
            $fields = array_merge($fields, $this->notationFields());
            $this->fields = $fields;
            $this->setNames();
        }
        return $this->fields;
    }

    private function setNames()
    {

        foreach ($this->fields as &$field) {
            $field["name"] = $field["p"] . "/" . $field["f"];
        }
    }

    private function notationFields(){


        $fields = array(
            array(
                "p" => $this->notationPath(),
                "f" => "figurines",
                "t" => "pcssvg",
                "label" => "Figurines"
            )
        );

        return $this->applyCat($fields, self::CATEGORY_NOTATIONS);
    }

    private function borderFields()
    {

        $fields = array(
            array(
                "p" => $this->bp() . "/background",
                "f" => "borderRadius",
                "t" => "n",
                "regex" => '/^[0-9]{1,2}$/',
                "size" => 4,
                "maxlen" => 3,
                "def" => 1,
                "defm" => 0,
                "suffix" => "",
                "label" => __('Border radius', "wordpresschess")
            ),
            array(
                "p" => $this->bp(),
                "f" => "padding",
                "t" => "n",
                "regex" => '/^[0-9\.]{1,3}%?$/',
                "size" => 5,
                "maxlen" => 4,
                "def" => 1,
                "defm" => 0,
                "suffix" => " of board size",
                "label" => __('Border size', "wordpresschess")
            ),
            array(
                "p" => $this->bp()."/background",
                "f" => "horizontal",
                "t" => "img",
                "regex" => null,
                "opt" => array(
                    self::$imgNone,
                    self::$bgPath . "wood-strip-horizontal.png",
                    self::$bgPath . "wood-strip2-horizontal.png",
                    self::$bgPath . "wood-strip3-horizontal.png",
                    self::$bgPath . "wood-strip5-horizontal.png",
                    self::$bgPath . "wood-strip6-horizontal.png",
                    self::$bgPath . "wood-strip-dark-horizontal.png",
                    self::$bgPath . "grey-wood-strip-horizontal.png",
                    self::$bgPath . "red-wood-strip-horizontal.png",
                ),
                "alternative" => array("from" => "horizontal", "to" => "vertical"),
                "size" => 3,
                "maxlen" => 2,
                "def" => 0,
                "defm" => 0,
                "suffix" => "",
                "label" => __('Border pattern', "wordpresschess")
            ),
            array(
                "p" => $this->bp() . "/background/paint",
                "f" => "fill",
                "t" => "clr",
                "regex" => null,
                "size" => 10,
                "maxlen" => 7,
                "def" => .8,
                "suffix" => "#RRGGBB",
                "label" => __('Background color', "wordpresschess")
            ),
            array(
                "p" => $this->bp(),
                "f" => "innerBorderWidth",
                "t" => "n",
                "regex" => "''",
                "size" => 3,
                "maxlen" => 2,
                "def" => 1,
                "css" => ".dhtml-chess-board",
                "cssType" => "px",
                "cssKey" => "border-width",
                "suffix" => "px",
                "label" => __('Thin border width around board', "wordpresschess")
            ),
            array(
                "p" => $this->bp(),
                "f" => "innerBorderColor",
                "t" => "clr",
                "regex" => null,
                "size" => 10,
                "maxlen" => 7,
                "css" => ".dhtml-chess-board",
                "cssType" => "clr",
                "cssKey" => "border-color",
                "def" => "#FFFFFF",
                "suffix" => "#RRGGBB",
                "label" => __('Thin border color', "wordpresschess")
            ),

        );

        return $this->applyCat($fields, self::CATEGORY_BORDER);
    }

    public function fieldByName($name)
    {
        $fields = $this->getFields();
        foreach ($fields as $field) {
            if ($field["name"] == $name) return $field;
        }
        return null;
    }


    private function labelFields(){
        $fields = array(
            array(
                "p" => $this->bp(),
                "f" => "labelPos",
                "t" => "radio",
                "opt" => array(
                    array("val" => "inside", "txt" => __('Inside', "wordpresschess")),
                    array("val" => "outside", "txt" => __('Border', "wordpresschess"))
                ),
                "regex" => null,
                "size" => 4,
                "maxlen" => 3,
                "def" => .8,
                "suffix" => "",
                "label" => __('Label pos', "wordpresschess")
            ),
            array(
                "p" => $this->bp() . "/labelStyles",
                "f" => "color",
                "t" => "clr",
                "regex" => null,
                "size" => 10,
                "maxlen" => 7,
                "def" => .8,
                "suffix" => "",
                "label" => __('Label color(B,D,F,H)', "wordpresschess")
            )


        );

        return $this->applyCat($fields, self::CATEGORY_LABELS);
    }

    private function arrowFields(){
        $fields = array(
            array(
                "p" => $this->bp() . "/plugins/0/styles",
                "f" => "fill",
                "t" => "clr",
                "regex" => '/^#[0-9A-Z]{6}$/',
                "size" => 10,
                "maxlen" => 7,
                "def" => 1,
                "suffix" => "",
                "label" => __('Arrow fill color', "wordpresschess")
            ),
            array(
                "p" => $this->bp() . "/plugins/0/styles",
                "f" => "fill-opacity",
                "t" => "t",
                "regex" => '/^#[0-9]?\.[0-9]$/',
                "size" => 4,
                "maxlen" => 3,
                "def" => .5,
                "suffix" => "0 = transparent, 1 = opaque",
                "label" => __('Arrow fill opacity(0-1)', "wordpresschess")
            ),
            array(
                "p" => $this->bp() . "/plugins/0/styles",
                "f" => "stroke",
                "t" => "clr",
                "regex" => '/^#[0-9A-Z]{6}$/',
                "size" => 10,
                "maxlen" => 7,
                "def" => 1,
                "suffix" => "",
                "label" => __('Arrow stroke color', "wordpresschess")
            ),
            array(
                "p" => $this->bp() . "/plugins/0/styles",
                "f" => "stroke-width",
                "t" => "n",
                "regex" => '/^[0-9]{1,2}$/',
                "size" => 3,
                "maxlen" => 2,
                "def" => 1,
                "suffix" => "px",
                "label" => __('Arrow stroke width', "wordpresschess")
            ),
            array(
                "p" => $this->bp() . "/plugins/0/styles",
                "f" => "stroke-opacity",
                "t" => "t",
                "regex" => '/^#[0-9]?\.[0-9]$/',
                "size" => 4,
                "maxlen" => 3,
                "def" => .8,
                "suffix" => "0 = transparent, 1 = opaque",
                "label" => __('Arrow stroke opacity(0-1)', "wordpresschess")
            ),

        );

        return $this->applyCat($fields, self::CATEGORY_ARROWS);

    }

    private function boardFields()
    {
        $fields = array(
            array(
                "p" => $this->bp(),
                "f" => "pieceLayout",
                "t" => "pcs",
                "label" => "Pieces"
            ),
            array(
                "p" => $this->bp(),
                "f" => "bgColorWhite",
                "t" => "clr",
                "regex" => '/^#[0-9A-Z]{6}$/',
                "size" => 10,
                "maxlen" => 7,
                "def" => 1,
                "suffix" => __("Will not be shown if background image is set", "wordpresschess"),
                "css" => ".dhtml-chess-square-white",
                "cssKey" => "background-color",
                "cssType" => "color",
                "label" => __('BG Color white', "wordpresschess")
            ),
            array(
                "p" => $this->bp(),
                "f" => "bgColorBlack",
                "t" => "clr",
                "regex" => '/^#[0-9A-Z]{6}$/',
                "size" => 10,
                "maxlen" => 7,
                "def" => 1,
                "suffix" => "#RRGGBB",
                "css" => ".dhtml-chess-square-black",
                "cssType" => "color",
                "cssKey" => "background-color",
                "label" => __('BG Color black', "wordpresschess")
            ),
            array(
                "p" => $this->bp(),
                "f" => "bgWhite",
                "t" => "img",
                "regex" => null,
                "opt" => self::$squareBgs,
                "size" => 3,
                "maxlen" => 2,
                "def" => 0,
                "defm" => 0,
                "suffix" => "%",
                "cssType" => "image",
                "css" => ".dhtml-chess-square-white",
                "cssKey" => "background-image",
                "label" => __('White Squares bg Image', "wordpresschess")
            ),
            array(
                "p" => $this->bp(),
                "f" => "bgBlack",
                "t" => "img",
                "regex" => null,
                "opt" => self::$squareBgs,
                "size" => 3,
                "maxlen" => 2,
                "def" => 0,
                "defm" => 0,
                "css" => ".dhtml-chess-square-black",
                "cssType" => "image",
                "cssKey" => "background-image",
                "suffix" => "%",
                "label" => __('Black Squares Image', "wordpresschess")
            ),


        );

        return $this->applyCat($fields, self::CATEGORY_BOARD);
    }

    private function applyCat($array, $cat)
    {
        foreach ($array as &$entry) {
            $entry["c"] = $cat;
        }
        return $array;
    }


    private function bp()
    {
        return "chess.view.board.Board";
    }

    private function notationPath(){
        return "chess.view.notation.Panel";
    }


}

