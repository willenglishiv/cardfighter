const _ = require('underscore');
const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const mkdirp = require('mkdirp');

const sets = ['BT01','BT02','BT03','BT04','BT05','BT06','BT07','BT08','BT09','BT10','BT11','BT12','BT13','BT14','BT15','BT16','BT17','G-BT01','G-BT02','G-BT03','G-BT04','G-BT05','G-BT06','G-BT07','G-BT08','G-BT09','G-BT10','EB01','EB02','EB03','EB04','EB05','EB06','EB07','EB08','EB09','EB10','EB11','EB12','G-EB01','G-TCB01','G-TCB02','G-CHB01','G-CHB02','G-CHB03','G-CB01','G-CB02','G-CB03','G-CB04','G-CB05',,'G-CMB01','FC02','G-FC01','G-FC02','G-FC03','G-FC04','G-SD01','G-SD02','G-LD01','G-LD02','G-LD03','TD01','TD02','TD03','TD04','TD05','TD06','TD07','TD08','TD09','TD10','TD11','TD12','TD13','TD14','TD16','TD17','G-TD01','G-TD02','G-TD03','G-TD04','G-TD05','G-TD06','G-TD07','G-TD08','G-TD09','G-TD10','G-TD11','G-TD12','G-TD14','PR','MT01','G-TB01','G-TB02','G-TTD01','G-RC01'];

function countCardSets() {
  // let subSets = ['BT01','BT02'];
  let brokenSets = [];
  let emptySets = [];
  let missingSets = [];
  sets.forEach(function(cs) {
    
    let dir = "cards/" + cs;
    let setDir = fs.readdirSync(dir);
    // console.log("CardSet: " + cs + " has " + setDir.length + " imported.");
    // console.log(setDir[0]);
    if ( setDir.length > 1) {

      let fileName = dir+"/"+setDir[0];
      // console.log( fileName );
      let cardFile = fs.readFileSync( fileName );
      // console.log(cardFile)
      let $ = cheerio.load( cardFile );
      let findTotal = $("p.pageLink").html().split('<br>')[0].split('\n')[1].split('[1 - 10 / ')[1].split(']')[0];
      // console.log("Bushiroad Reports: " + findTotal);

      let missing = findTotal - setDir.length;

      if ( missing > 0 && cs !== "G-TD04" ) {
        console.log('***************');
        console.log("Set: " + cs + " >> Has " + setDir.length + " / " + findTotal + " cards imported. " + (findTotal - setDir.length) + " cards are missing.");
        brokenSets.push(cs);
      }

    } else {
      if ( 1 === setDir.length ) {
        emptySets.push(cs);
      }

      if ( 0 === setDir.length ) {
        missingSets.push(cs);
      }
    }


  });

  console.log(brokenSets);
  console.log(emptySets);
  console.log(missingSets);
}

// const fixSets = ['BT11','BT15','G-BT09','G-BT10','G-CHB01','G-CHB02','G-CHB03','G-CB05'];


 const fixSets = [ 
  // 'BT15',
  // 'G-BT09',
  // 'G-BT10',
  // 'G-CHB01',
  'G-CHB02',
  'G-CHB03',
  'G-CB05',
  // 'G-TD04',
  // 'PR' 
  'MT01'
];

countCardSets();


function getAllCards() {

   sets.forEach(function(cs) {

    getSetOfCards(cs);

  });

}

const missingSets = [ 'G-RC01' ];

function getFixSets(){

  missingSets.forEach(function(cs) {

    getSetOfCards(cs);

  });

}

// getFixSets();
// getSetOfCards('G-BT09');

function getSetOfCards(cardSet) {

  let cardID = cardSet + "/001EN";

  // PR uses 4 numbers instead of 3 and starts at 0 rather than at 1, so handle specifically.
  if ( "PR" === cardSet ) {
    cardID = "PR/0000EN";
  }

  if ( "BT15" === cardSet ) {
    cardID = "BT15/000EN";
  }
  
  if ( "EB10" === cardSet ) {
    cardID = "EB10/001EN-B"; // First Card is different
  }

  mkdirp("cards/" + cardSet, function (err) {
    if (err) {
      console.error(err);
    }
  });

  getCard(cardID);

}

// getCard('G-BT10/103EN');
// getCard('BT15/000EN');
// getCard('G-BT10/S01EN');
// getCard('G-BT09/Re:01EN');
// getSpecialCards();
// getCard('BWC2015/VG01EN');
// getCard('BWC2015/VG02EN');
// getCard('BWC2016/VG01EN');
// getCard('BWC2016/VG02EN');
// getCard('G-BT01/088EN PR');
// getCard('G-BT02/016EN PR');


// const getOneCard = true;
const getOneCard = false;

function getCard( cardID ) {
  let cardUrl = "http://cf-vanguard.com/en/cardlist/?cardno=" + cardID;
	request(cardUrl, function(err,res,body) {
		if ( !err ) {
			// console.log(body);
			// out.write(body);
      processCard(body,cardID);
		} else {
      console.log("request error: " + err );
    }
	});
}

function getSpecialCards() {
  let cardUrls = [
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT09/Re:01EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT09/Re:03EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT09/Re:04EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT09/Re:05EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT10/Re%EF%BC%9A01EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT10/Re%EF%BC%9A02EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT10/Re%EF%BC%9A03EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-BT10/Re%EF%BC%9A03EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:01EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:02EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:03EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:04EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:05EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:06EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:07EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:08EN',
    // 'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB01/Re:09EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB02/Re:01EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB02/Re:02EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB02/Re:03EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB02/Re:04EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB03/Re:01EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CHB03/Re:02EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CB05/Re:01EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CB05/Re:02EN',
    'http://cf-vanguard.com/en/cardlist/?cardno=G-CB05/Re:03EN',
  ];

  let cardIDs = [
    // 'G-BT09/Re01EN',
    // 'G-BT09/Re03EN',
    // 'G-BT09/Re04EN',
    // 'G-BT09/Re05EN',
    // 'G-BT10/Re01EN',
    // 'G-BT10/Re02EN',
    // 'G-BT10/Re03EN',
    // 'G-BT10/Re04EN',
    // 'G-CHB01/Re01EN',
    // 'G-CHB01/Re02EN',
    // 'G-CHB01/Re03EN',
    // 'G-CHB01/Re04EN',
    // 'G-CHB01/Re05EN',
    // 'G-CHB01/Re06EN',
    // 'G-CHB01/Re07EN',
    // 'G-CHB01/Re08EN',
    // 'G-CHB01/Re09EN',
    'G-CHB02/Re01EN',
    'G-CHB02/Re02EN',
    'G-CHB02/Re03EN',
    'G-CHB02/Re04EN',
    'G-CHB03/Re01EN',
    'G-CHB03/Re02EN',
    'G-CB05/Re01EN',
    'G-CB05/Re02EN',
    'G-CB05/Re03EN',
  ];

  for (let i=0; i<cardUrls.length; i++) {
    request(cardUrls[i], function(err,res,body) {
      if ( !err ) {
        // console.log(body);
        // out.write(body);
        processCard(body,cardIDs[i]);
      } else {
        console.log("request error: " + err );
      }
    });


  }


}

function processCard( data , cardID ) {

  let cardSplit = cardID.split('/');
  let cardSet = cardSplit[0];
  let cardNumber = cardSplit[1];
  let folder = cardSet;

  if ( "BWC2015" === cardSet || "BWC2016" === cardSet || "G-BT01/088EN PR" === cardID || "G-BT02/016EN PR" === cardID ) {
    // special handling (ugh)
    folder = "PR";
  }

  let cardFilename = "cards/" + folder + "/" + cardSet + "-" + cardNumber + ".html";
  // let newStr = cardFilename.replace("Re:","Re");
  // let fixSplit = cardFilename.split('：'); // weird JS colon? dafuq?
  // if (fixSplit[1]) {
  //   cardFilename = fixSplit[0] + fixSplit[1];
  // }
  // console.log("**** newCard *****");
  // console.log("cardFilename: " + cardFilename);
  // console.log("newStr: " + newStr);
  // console.log("fixSplit: " + fixSplit);
  // if ( cardFilename !== newStr ) cardFilename = newStr;
  // console.log(cardFilename);
  // write the card
  const out = fs.createWriteStream(cardFilename);
  out.write(data);

  out.on('error',function(err){
    console.log("filestream error: " + err);
  });

  // TODO: Add to DB or CSV file

  // Parse the data to find the info
  let $ = cheerio.load( data );

  let findLink = $('p.neighbor').children().last().attr('href');
  // console.log(findLink);
  if ( undefined !== findLink && !getOneCard ) {
    //then we call the next source.
    // if ( ( "?cardno=BT02/003EN" !== findLink ) && ( "?cardno=BT01/003EN" !== findLink ) ) { 
      let nextCardID = findLink.slice(8);
      // console.log( "The Next Card: " + nextCardID );
      getCard(nextCardID);
    // }

  }

  console.log("done with this card: " + cardID );

}

function createRecord() {




}


function getBaseLink() {
  let tcgurl = {};
  tcgurl['BT01'] = 'http://store.tcgplayer.com/cardfight-vanguard/descent-of-the-king-of-knights';
tcgurl['BT02'] = 'http://store.tcgplayer.com/cardfight-vanguard/onslaught-of-dragon-souls';
tcgurl['BT03'] = 'http://store.tcgplayer.com/cardfight-vanguard/demonic-lord-invasion';
tcgurl['BT04'] = 'http://store.tcgplayer.com/cardfight-vanguard/eclipse-of-illusionary-shadows';
tcgurl['BT05'] = 'http://store.tcgplayer.com/cardfight-vanguard/awakening-of-twin-blades';
tcgurl['BT06'] = 'http://store.tcgplayer.com/cardfight-vanguard/breaker-of-limits';
tcgurl['BT07'] = 'http://store.tcgplayer.com/cardfight-vanguard/rampage-of-the-beast-king';
tcgurl['BT08'] = 'http://store.tcgplayer.com/cardfight-vanguard/blue-storm-armada';
tcgurl['BT09'] = 'http://store.tcgplayer.com/cardfight-vanguard/clash-of-knights-and-dragons';
tcgurl['BT10'] = 'http://store.tcgplayer.com/cardfight-vanguard/triumphant-return-of-the-king-of-knights';
tcgurl['BT11'] = 'http://shop.tcgplayer.com/cardfight-vanguard/seal-dragons-unleashed?ProductType=All';
tcgurl['BT12'] = 'http://store.tcgplayer.com/cardfight-vanguard/binding-force-of-the-black-rings';
tcgurl['BT13'] = 'http://store.tcgplayer.com/cardfight-vanguard/catastrophic-outbreak';
tcgurl['BT14'] = 'http://store.tcgplayer.com/cardfight-vanguard/brilliant-strike';
tcgurl['BT15'] = 'http://store.tcgplayer.com/cardfight-vanguard/infinite-rebirth';
tcgurl['BT16'] = 'http://shop.tcgplayer.com/cardfight-vanguard/legion-of-dragons-and-blades-vere?ProductType=All';
tcgurl['BT17'] = 'http://store.tcgplayer.com/cardfight-vanguard/blazing-perdition-vere';
tcgurl['EB01'] = 'http://store.tcgplayer.com/cardfight-vanguard/eb-comic-style-vol-1';
tcgurl['EB02'] = 'http://store.tcgplayer.com/cardfight-vanguard/eb-banquet-of-divas';
tcgurl['EB03'] = 'http://store.tcgplayer.com/cardfight-vanguard/eb-cavalry-of-black-steel';
tcgurl['EB04'] = 'http://shop.tcgplayer.com/cardfight-vanguard/legion-of-dragons-and-blades-vere';
tcgurl['EB05'] = 'http://shop.tcgplayer.com/cardfight-vanguard/cardfight-vanguard/eb-celestial-valkyries';
tcgurl['EB06'] = 'http://store.tcgplayer.com/cardfight-vanguard/eb-dazzling-divas';
tcgurl['EB07'] = 'http://shop.tcgplayer.com/cardfight-vanguard/cardfight-vanguard/eb-mystical-magus';
tcgurl['EB08'] = 'http://store.tcgplayer.com/cardfight-vanguard/eb-champions-of-the-cosmos';
tcgurl['EB09'] = 'http://store.tcgplayer.com/cardfight-vanguard/eb-divine-dragon-progression';
tcgurl['EB10'] = 'special handling';
tcgurl['EB11'] = 'http://shop.tcgplayer.com/cardfight-vanguard/eb-requiem-at-dusk?partner=wwwtcg';
tcgurl['EB12'] = 'http://shop.tcgplayer.com/cardfight-vanguard/eb-waltz-of-the-goddess?partner=wwwtcg';
tcgurl['FC02'] = 'http://store.tcgplayer.com/cardfight-vanguard/fighters-collection-2014';
tcgurl['G-BT01'] = 'http://store.tcgplayer.com/cardfight-vanguard/generation-stride';
tcgurl['G-BT02'] = 'http://store.tcgplayer.com/cardfight-vanguard/soaring-ascent-of-gale-and-blossom';
tcgurl['G-BT03'] = 'http://store.tcgplayer.com/cardfight-vanguard/sovereign-star-dragon';
tcgurl['G-BT04'] = 'http://store.tcgplayer.com/cardfight-vanguard/soul-strike-against-the-supreme';
tcgurl['G-BT05'] = 'http://shop.tcgplayer.com/cardfight-vanguard/moonlit-dragonfang?issingles=true';
tcgurl['G-BT06'] = 'http://shop.tcgplayer.com/cardfight-vanguard/transcension-of-blade-and-blossom?ProductType=All';
tcgurl['G-BT07'] = 'http://shop.tcgplayer.com/cardfight-vanguard/glorious-bravery-of-radiant-sword?ProductType=All';
tcgurl['G-BT08'] = 'http://shop.tcgplayer.com/cardfight-vanguard/absolute-judgment?ProductType=All';
tcgurl['G-BT09'] = 'http://shop.tcgplayer.com/cardfight-vanguard/divine-dragon-caper?ProductType=All';
tcgurl['G-BT10'] = 'http://shop.tcgplayer.com/cardfight-vanguard/raging-clash-of-the-blade-fangs?ProductType=All';
tcgurl['G-CB01'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-cb01-academy-of-divas';
tcgurl['G-CB02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-cb02-commander-of-the-incessant-waves';
tcgurl['G-CB03'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-cb03-blessing-of-divas?ProductType=All';
tcgurl['G-CB05'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-cb04-gear-of-fate?ProductType=All';
tcgurl['G-CB05'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-cb05-prismatic-divas?ProductType=All';
tcgurl['G-CHB01'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-chb01-try3-next?ProductType=All';
tcgurl['G-CHB02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-chb02-we-are-trinity-dragon?ProductType=All';
tcgurl['G-CHB03'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-chb03-rummy-labyrinth-under-the-moonlight?ProductType=All';
tcgurl['G-CMB01'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-cmb01-vanguard-and-deletor';
tcgurl['G-EB01'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-eb01-cosmic-roar';
tcgurl['G-FC01'] = 'http://store.tcgplayer.com/cardfight-vanguard/fighters-collection-2015';
tcgurl['G-FC02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/fighters-collection-2015-winter';
tcgurl['G-FC03'] = 'http://store.tcgplayer.com/cardfight-vanguard/fighters-collection-2016';
tcgurl['G-FC04'] = 'http://shop.tcgplayer.com/cardfight-vanguard/fighters-collection-2017?ProductType=All';
tcgurl['G-LD01'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-legend-deck-vol1-the-dark';
tcgurl['G-LD02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-legend-deck-vol2-the-overlord-blaze';
tcgurl['G-LD03'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-legend-deck-vol3-the-blaster';
tcgurl['G-RC01'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-rc01-revival-collection?ProductType=All';
tcgurl['G-SD01'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-start-deck-1-odyssey-of-the-interspatial-dragon';
tcgurl['G-SD02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-start-deck-2-knight-of-the-sun?ProductType=All';
tcgurl['G-TB01'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-tb01-touken-ranbu-online';
tcgurl['G-TB02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-tb02-touken-ranbu-online?ProductType=All';
tcgurl['G-TCB01'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-tcb01-the-reckless-rampage?issingles=true';
tcgurl['G-TCB02'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-tcb02-the-genius-strategy?ProductType=All';
tcgurl['G-TD01'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-td01-awakening-of-the-interdimensional-dragon';
tcgurl['G-TD02'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-td02-divine-swordsman-of-the-shiny-star';
tcgurl['G-TD03'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-td03-flower-maiden-of-purity';
tcgurl['G-TD04'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-td04-blue-cavalry-of-the-divine-marine-spirits';
tcgurl['G-TD05'] = 'http://store.tcgplayer.com/cardfight-vanguard/g-td05-fateful-star-messiah';
tcgurl['G-TD06'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td06-rallying-call-of-the-interspectral-dragon?issingles=true';
tcgurl['G-TD07'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td07-illusionist-of-the-crescent-moon?issingles=true';
tcgurl['G-TD08'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td08-vampire-princess-of-the-nether-hour?ProductType=All';
tcgurl['G-TD09'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td09-true-zodiac-time-beasts?ProductType=All';
tcgurl['G-TD10'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td10-ritual-of-dragon-sorcery?ProductType=All';
tcgurl['G-TD11'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td11-divine-knight-of-heavenly-decree';
tcgurl['G-TD12'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td12-flower-princess-of-abundant-blooming';
tcgurl['G-TD14'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-td14-debut-of-the-divas?ProductType=All';
tcgurl['G-TTD01'] = 'http://shop.tcgplayer.com/cardfight-vanguard/g-ttd01-touken-ranbu-online?ProductType=All';
tcgurl['MT01'] = 'http://store.tcgplayer.com/cardfight-vanguard/mega-trial-deck-1-rise-to-royalty';
tcgurl['PR'] = 'http://store.tcgplayer.com/cardfight-vanguard/promo-cards';
tcgurl['TD01'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-1-blaster-blade';
tcgurl['TD02'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-2-dragonic-overlord';
tcgurl['TD03'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-3-golden-mechanical-soldier';
tcgurl['TD04'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-4-maiden-princess-of-the-cherry-blossom';
tcgurl['TD05'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-5-slash-of-silver-wolf';
tcgurl['TD06'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-6-resonance-of-thunder-dragon';
tcgurl['TD07'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-7-descendants-of-the-marine-emperor';
tcgurl['TD08'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-8-liberator-of-the-sanctuary';
tcgurl['TD09'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-9-eradicator-of-the-empire';
tcgurl['TD10'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-10-purgatory-revenger';
tcgurl['TD11'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-11-star-vader-invasion';
tcgurl['TD12'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-12-dimensional-brave-kaiser';
tcgurl['TD13'] = 'http://store.tcgplayer.com/cardfight-vanguard/trial-deck-13-successor-of-the-sacred-regalia';
tcgurl['TD14'] = 'http://shop.tcgplayer.com/cardfight-vanguard/trial-deck-14-seeker-of-hope?partner=wwwtcg';
tcgurl['TD16'] = 'http://shop.tcgplayer.com/cardfight-vanguard/trial-deck-16-divine-judgement-o-t-bluish-flames?partner=wwwtcg';
tcgurl['TD17'] = 'http://shop.tcgplayer.com/cardfight-vanguard/trial-deck-17-will-of-the-locked-dragon?partner=wwwtcg';
return tcgurl;
}