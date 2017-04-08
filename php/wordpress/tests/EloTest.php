<?php

/**
 * Created by IntelliJ IDEA.
 * User: alfmagne1
 * Date: 25/01/2017
 * Time: 12:17
 */

define( 'ABSPATH', dirname( __FILE__ ) . '/../wordpress/' );
require_once( ABSPATH . '/wp-config.php' );
require_once( "../wordpress/wp-includes/load.php" );
require_once( "../wordpress/wp-includes/plugin.php" );
require_once( "../wordpress/wp-includes/wp-db.php" );
require_once( ABSPATH . WPINC . '/version.php' );

require_once( __DIR__ . "/../../../autoload.php" );

class EloTest extends PHPUnit_Framework_TestCase {


	private $wpdb;

	/**
	 * @var DhtmlChessKeyValue $store
	 */
	private $store;

	const PLAYER_ID_WHITE = 1;
	const PLAYER_ID_BLACK = 2;

	public function setUp() {

		$this->wpdb = new wpdb( "root", "", "wordpress3", "localhost" );
		global $wpdb;
		$wpdb = $this->wpdb;

		$store = $this->store = new DhtmlChessKeyValue();
		$store->remove( DhtmlChessElo::GAME_KEY_PUZZLE_COUNT . "_1" );
		$store->remove( DhtmlChessElo::GAME_KEY_PUZZLE_ELO . "_1" );
		$store->remove( DhtmlChessElo::GAME_KEY_PUZZLE_LAST_ID . "_1" );

		for ( $i = 1; $i < 20; $i ++ ) {
			$store->remove( DhtmlChessElo::GAME_KEY_MULTIPLAY_ELO . "_" . $i );
			$store->remove( DhtmlChessElo::GAME_KEY_MULTIPLAY_COUNT . "_" . $i );
		}

		$wpdb->query("delete from ". DhtmlChessDatabase::TABLE_ELO);
	}




	/**
	 * @test
	 */
	public function shouldSaveEloInDatabase(){
		// given
		$eloDb = new DhtmlChessEloDb();

		// when
		$eloDb->upsert(1, "puzzle", 1450);

		// then
		$this->assertEquals(1450, $eloDb->getElo("puzzle", 1));
	}


	/**
	 * @test
	 */
	public function shouldUpdateEloAndNotInsertNew(){
		// given
		$eloDb = new DhtmlChessEloDb();

		// when
		$eloDb->upsert(1, "puzzle", 1450);
		$eloDb->upsert(1, "puzzle", 1500);

		// then
		$this->assertEquals(1500, $eloDb->getElo("puzzle", 1));

	}

	/**
	 * @test
	 */
	public function shouldGetEloChange() {
		// given
		$elo = new DhtmlChessElo();

		$change = $elo->eloChange( 1400, 1400, DhtmlChessElo::WHITE_WIN );

		// then
		$this->assertEquals( 15, $change );

	}

	/**
	 * @test
	 */
	public function shouldNotIncrementPuzzleEloForSamePuzzleInSequence(){

		// given
		$eloObj = new DhtmlChessElo();

		// when
		$eloStart = $eloObj->onPuzzleSolvedAuto(1, 1, 1, 10000);
		$elo = $eloObj->onPuzzleSolvedAuto(1, 1, 1, 10000);

		// then
		$this->assertEquals(round($elo), round($eloStart), "Should increment, but was $elo after $eloStart");
	}

	/**
	 * @test
	 */
	public function shouldIncrementEloOnPuzzleSolved(){

		// given
		$eloObj = new DhtmlChessElo();

		// when
		$eloStart = $eloObj->onPuzzleSolved(1, 1400, 1);
		$elo = $eloObj->onPuzzleSolved(1, 1400, 2);

		// then
		$this->assertTrue($elo > $eloStart, "Should increment, but was $elo after $eloStart");

	}

	public function shouldDecrementOnPuzzleFailed(){
		// given
		$eloObj = new DhtmlChessElo();

		$elo = $eloObj->getPuzzleElo(1);

		$eloAfter = $eloObj->onPuzzleFailed(1, 1400);

		// then
		$this->assertTrue($eloAfter < $elo, "Wrong elo on failed, before: $elo, after: $eloAfter");

	}

	/**
	 * @test
	 */
	public function shouldIncrementPuzzlesPlayed() {

		// given
		$elo = new DhtmlChessElo();

		// when
		$elo->onPuzzlesolved( 1, 1400 );
		$elo->onPuzzlesolved( 1, 1400 );

		// then
		$this->assertEquals( 2, $elo->countPuzzleGames( 1 ) );
	}

	/**
	 * @test
	 */
	public function shouldGiveDoubleEloOnFirstPuzzlesSolved() {
		// given
		$elo = new DhtmlChessElo();

		// when
		$newElo = $elo->onPuzzlesolved( 1, 1400 );

		// then
		$this->assertEquals( 1430, $newElo );

	}
	/**
	 * @test
	 */
	public function shouldGiveDoubleEloOnFirstPuzzlesSolvedAuto() {
		// given
		$elo = new DhtmlChessElo();

		// when
		$newElo = $elo->onPuzzlesolved( 1, 1400 );

		// then
		$this->assertEquals( 1430, $newElo );

	}

	/**
	 * @test
	 */
	public function shouldGiveDoublePointsOnFirstPuzzlesNotSolved() {
		// given
		$elo = new DhtmlChessElo();

		// when
		$newElo = $elo->onPuzzleFailed( 1, 1400 );

		// then
		$this->assertEquals( 1370, $newElo );
	}

	/**
	 * @test
	 */
	public function shouldGiveNormalEloAfterProvisional() {

		// given
		$elo = new DhtmlChessElo();

		for ( $i = 0; $i < 20; $i ++ ) {
			$elo->onPuzzleSolved( 1, 1400 );
		}

		$opponentElo = $elo->getPuzzleElo( 1 );

		// when
		$newElo = $elo->onPuzzleSolved( 1, $opponentElo );

		// then
		$this->assertEquals( $opponentElo + 15, $newElo );
	}


	/**
	 * @test
	 */
	public function shouldDetermineEloFromMovesAndTimeUsedOnPuzzles(){
		// given
		$eloObj = new DhtmlChessElo();

		// when
		$elo = $eloObj->puzzleOppenentElo(5, 0);

		// then
		$this->assertEquals(2250, $elo);


		$elo = $eloObj->puzzleOppenentElo(5, 60000);
		$this->assertEquals(2010, $elo);


		$elo = $eloObj->puzzleOppenentElo(3, 60000);
		$this->assertEquals(1510, $elo);



	}

	/**
	 * @test
	 */
	public function shouldNotSaveSamePuzzleIdOverAgain() {
		// given
		$elo = new DhtmlChessElo();

		for ( $i = 0; $i < 20; $i ++ ) {
			$elo->onPuzzleSolved( 1, 1400, 1 );
		}

		// then
		$this->assertEquals( 1430, $elo->getPuzzleElo( 1 ) );
	}

	/**
	 * @test
	 */
	public function shouldSetInitialEloForPuzzles(){
		// given
		$eloObj = new DhtmlChessElo();

		// when
		$elo = $eloObj->getPuzzleElo(1);

		// then
		$this->assertEquals(1400, $elo);
	}



	/**
	 * @test
	 */
	public function shouldUpdateBothPlayersRatingInMultiplayer() {

		// given
		$elo = new DhtmlChessElo();

		// when
		$elo->onGameEnd(
			1,
			2, DhtmlChessElo::WHITE_WIN );

		$eloWhite = $elo->getMultiPlayElo( 1 );
		$eloBlack = $elo->getMultiPlayElo( 2 );

		// then
		$this->assertEquals( 1430, $eloWhite );
		$this->assertEquals( 1370, $eloBlack );
	}


	/**
	 * @test
	 */
	public function shouldBeAbleToGetCountMultiplayGames() {
		// given
		$elo = new DhtmlChessElo();

		// when
		// when
		$elo->onGameEnd(
			1,
			2, DhtmlChessElo::BLACK_WIN );
		$elo->onGameEnd(
			1,
			3, DhtmlChessElo::BLACK_WIN );


		// then
		$this->assertEquals( 2, $elo->countMultiGames( 1) );
		$this->assertEquals( 1, $elo->countMultiGames( 2 ) );
		$this->assertEquals( 1, $elo->countMultiGames( 3 ) );
	}

	/**
	 * @test
	 */
	public function shouldNotUpdateWhiteIfBlackIsProvisionalAndWhiteIsNot() {
		// given
		$elo = new DhtmlChessElo();
		$this->setMultiCount( self::PLAYER_ID_WHITE, 20 );
		$this->setMultiCount( self::PLAYER_ID_BLACK, 1 );

		$this->assertEquals( 20, $elo->countMultiGames( self::PLAYER_ID_WHITE ) );
		$this->assertEquals( 1, $elo->countMultiGames( self::PLAYER_ID_BLACK ) );

		// when
		$elo->onGameEnd(
			1,
			2, DhtmlChessElo::BLACK_WIN );

		// then
		$this->assertEquals( 1430, $elo->getMultiPlayElo( self::PLAYER_ID_BLACK ) );
		$this->assertEquals( 1400, $elo->getMultiPlayElo( self::PLAYER_ID_WHITE ) );

	}





	private function setMultiCount( $playerId, $count ) {
		$this->store->upsert( DhtmlChessElo::GAME_KEY_MULTIPLAY_COUNT . "_" . $playerId, $count );
	}

	private function setMultiPlayerElo( $playerId, $elo ) {
		$this->store->upsert( DhtmlChessElo::GAME_KEY_MULTIPLAY_ELO . "_" . $playerId, $elo );
	}
}

