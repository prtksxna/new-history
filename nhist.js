mw.loader.using( 'moment', function() {

/**
 * This looks at `#pagehistory` and creates an array of objects
 * that contain keys for the columns we need and corresponding
 * DOM nodes.
 *
 * @returns {Object}
 */
var getDataFromList = function() {
  var data = [];
  $( '#pagehistory > li' ).each( function ( index, item ) {
    var itemData = {};
    var $item = $( item );

    itemData.$diff = $item.find( '.mw-history-histlinks' );
    itemData.$select = $item.find( 'input[type="radio"]' );
    itemData.$supress = $item.find( 'input[type="checkbox"]' );
    itemData.$time = $item.find( '.mw-changeslist-date' );
    itemData.$who = $item.find( '.history-user' );
    itemData.$type = $item.find( '.minoredit' );
    itemData.$bytes = $item.find( '.history-size' );
    itemData.$change = $item.find( '.mw-plusminus-pos, .mw-plusminus-neg, .mw-plusminus-null' );
    itemData.$comment = $item.find( '.comment' );

    // TODO: There has to be a better way to get all the actions
    itemData.$actions = $item.find( '.mw-rollback-link, .mw-history-undo' );

    data.push( itemData );
  } );
  return data;
}

/**
 * Given a string in the format:
 *    22:00, 25 January 2018‎
 * this function first converts it into a Date object and
 * then uses moment.js to create humanized version.
 *
 * @param {string} str
 * @returns {string} timeAgo
 */
var getAgoFromTimeString = function ( str ) {
    var months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

    var date = str.split( ',' )[ 1 ].split( ' ' );
    var time = str.split( ',' )[ 0 ].split( ':' );

    var hr = +time[ 0 ];
    var min = +time[ 1 ];
    var day = +date[ 1 ];
    var mon = months.indexOf(date[ 2 ]);
    var year = +date[ 3 ];

    var dateObj = new Date();
    dateObj.setHours( hr );
    dateObj.setMinutes( min );
    dateObj.setDate( day );
    dateObj.setMonth( mon );
    dateObj.setYear( year );

    var now = new Date();
    var duration = now - dateObj;
    return moment.duration( duration ).humanize() + ' ago';
}

/**
 * Given the change text with brackets and a sign this
 * function returns an integer
 *
 * @param {string} change
 * @returns {int}
 */
var getValueFromChange = function( change ) {
  changeArr = change.split( '' );

  // Remove brackets
  changeArr.pop();
  changeArr.shift();

  return parseInt( changeArr.join( '' ) );
}

/**
 * Find the maximum change size given a set of changes
 *
 * @param {Object} data
 * @returns {int}
 */
var getMaxChange = function ( data ) {
  var max = 0;

  data.forEach( function ( item ) {
    var value = Math.abs( getValueFromChange( item.$change.text() ) );
    max = ( value > max ) ? value : max;
  } );

  return max;
}

/**
 * Generates a visualisation to show the amount of change
 *
 * @param {string} change
 * @param {int} max
 */
var generateVizFromChange = function ( change, max ) {
  var value = getValueFromChange( change );
  var percent = Math.ceil( ( Math.abs( value ) * 100.0 ) / max );
  var color = ( value > 0 ) ? '#00af89' : '#d33';

  var $viz = $( '<div>' )
    .attr( 'title', change )
    .css( {
      'background-color': color,
      'height': '20px',
      'width': percent + 'px',
      'float': 'right'
    } );

  return $viz;
}

/**
 * Given data about a history page this function
 * shows that data in the form of a table
 *
 * @param {Object} data
 * @returns {jQuery} $table
 */
var generateTableFromData = function( data ) {
  var $table = $( '<table>' ).addClass( 'mw-history-table' );
  var max = getMaxChange( data );

  data.forEach( function( item ) {
    var $row = $( '<tr>' );

    var $agoTime = item.$time.clone();
    $agoTime
      .attr( 'title', $agoTime.text() )
      .text( getAgoFromTimeString( $agoTime.text() ) );

    var $changeViz = generateVizFromChange( item.$change.text(), max );

    $row.append( $( '<td>' ).append( item.$diff.clone() ) );
    $row.append( $( '<td>' ).append( item.$select.clone() ) );
    $row.append( $( '<td>' ).append( item.$supress.clone() ) );
    $row.append( $( '<td>' ).append( item.$comment.clone() ) );
    $row.append( $( '<td>' ).append( item.$type.clone() ) );
    $row.append( $( '<td>' ).append( $agoTime ) );
    $row.append( $( '<td>' ).append( item.$who.clone() ) );
    $row.append( $( '<td>' ).append( $changeViz ) );
    $row.append( $( '<td>' ).append( item.$actions.clone() ) );

//  Size hidden
//  $row.append( $( '<td>' ).append( item.$bytes.clone() ) );

    $table.append( $row );
  } );

  return $table;
}


// == Bootstrap ==
if ( $( '#pagehistory' ) ) {
  var data = getDataFromList();
  var $table = generateTableFromData( data );

  $( '#mw-history-compare' ).append( $table );
}

} ); // End mw.loader
