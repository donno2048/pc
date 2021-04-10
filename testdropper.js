var types=["fireworks","circles","boxes"],backElements=[],backData=[],clientCSS="",specificCSS=[],backThread=null,addedBackStyle=false;
function backdropInit(){
  var styleTag=document.createElement("style");
  styleTag.setAttribute("id","backdrop_style");
  styleTag.appendChild(document.createTextNode(".backdrop_canvas{display:block; position:absolute; top:0; left:0; width:100%; height:100%;}"));
  document.body.appendChild(styleTag);
}
var backdrop={
  init: function(){if (document.getElementById("backdrop_style")==null) backgroundInit();},  
  add: function(type,element,nickname,extraindex){
    var multiple=false,selected,localParents=[];
    if (!addedBackStyle){
      backdropInit();
      addedBackStyle=true;
    }
    localParents=getAll(element);
    if (Array.isArray(nickname)){
      extraindex=nickname;
      nickname="";
    }
    else if (typeof nickname=="string") nickname=nickname.replace("%","");
    else if (nickname==null) nickname="";
    else{extraIndex=nickname; nickname=""}
    if (Array.isArray(extraindex)&&!element.startsWith("#")){
      var tmpArr=[];
      for (var i=0;i<extraindex.length;i++){
        if (extraindex[i]>=0&&extraindex[i]<localParents.length){
          tmpArr.push(localParents[extraindex[i]]);
        }
      }
      localParents=tmpArr;
    }
    else if (extraindex!=null&&!element.startsWith("#")){
      if (extraindex>=0&&extraindex<localParents.length){
        var single=localParents[extraindex];
        localParents=[];
        localParents.push(single);
      }
    }
    for (var i=0;i<types.length;i++){
      if (type==types[i]){
        selected=types[i];
        break;
      }
    }
    addElements(localParents,selected,nickname);
  },
  remove: function(element,index){
    var localParents=getAll(element),actElements=[],toRemove=[];
    if (Array.isArray(index)) toRemove=index;
    else if (index!=null) toRemove.push(index);
    else for (var i=0;i<localParents.length;i++) toRemove.push(i);
    if (element.startsWith("%")||element.startsWith("t:")) for (var i=0;i<toRemove.length;i++) if (toRemove[i]>=0&&toRemove[i]<localParents.length) actElements.push(localParents[toRemove[i]]);
    else{
      for (var i=0;i<toRemove.length;i++){
        if (toRemove[i]>=0&&toRemove[i]<localParents.length){
          var tr=localParents[toRemove[i]].getElementsByClassName("backdrop_canvas");
          for (var n=0;n<tr.length;n++) actElements.push(tr[n]);
        }
      }
    }
    for (var i=0;i<actElements.length;i++){
      actElements[i].parentElement.removeChild(actElements[i]);
      removeChild2(actElements[i]);
    }
  },
  addCSS: function(inputCSS){
    clientCSS=inputCSS;
    setCSS();
  },
  start: function(fps){
    if (fps==null) fps=30;
    var timeout=Math.floor(1000/fps);
    if (backThread!=null) clearInterval(backThread);
    backThread=setInterval(paintEffects,timeout);
  },
  stop: function(){clearInterval(backThread);},
  getElementsByNickname: function(element){return getAll("%"+element);},
  getElementsByType: function(element){return getAll("t:"+element);},
  addSpecificCSS: function(element,css){
    if (element.startsWith("%")||element.startsWith("t:")){
      var tmpName=element.replace("%","").replace("t:",""),found=false;
      for (var i=0;i<specificCSS.length;i+=2){
        if (specificCSS[i]==tmpName){
          if (element.startsWith("%")){specificCSS[i+1]=".backdrop_canvas[nickname="+tmpName+"]{"+css+"}";}
          else {specificCSS[i+1]=".backdrop_canvas[type="+tmpName+"]{"+css+"}";}
          found=true;
        }
      }
      if (!found){
        if (element.startsWith("%")){specificCSS.push(tmpName,".backdrop_canvas[nickname="+tmpName+"]{"+css+"}");}
        else {specificCSS.push(tmpName,".backdrop_canvas[type="+tmpName+"]{"+css+"}");}
      }
      setCSS();
    }
  },
  resize: function(){
    for (var i=0;i<backData.length;i++){
      var parent=backElements[i].parentElement,w=parent.offsetWidth, h=parent.offsetHeight;
      if (backData[i].width!=w||backData[i].height!=h){
        backData[i].width=w;
        backData[i].height=h
        backElements[i].width=w;
        backElements[i].height=h;
      }
    }
  },
  canvasData: function(element){
    var all=document.getElementsByClassName("backdrop_canvas"),out=[],clean=(element.replace("%","")).replace("t:","");
    if (element.startsWith("%")) for (var i=0;i<backData.length;i++) if (all[i].getAttribute("nickname")==clean) out.push(backData[i]);
    else if (element.startsWith("t:")) for (var i=0;i<backData.length;i++) if (all[i].getAttribute("type")==clean) out.push(backData[i]);
    return out;
  },
  multiData: function(type,obj){
    type=type.replace("t:","");
    for (var i=0;i<backData.length;i++){
      var bd=backData[i];
      if (backData[i].type==type){
        var values=Object.keys(obj),bdVals=Object.keys(bd);
        for (var m=0;m<values.length;m++) for (var n=1;n<bdVals.length;n++) if (bdVals[n]==values[m]) bd[bdVals[n]]=obj[values[m]];
      }
      if (type=="circles"){
        bd.array=[];
        setCircles(bd);
      }
    }
  }
}
function setCSS(){
  var cCSS=".backdrop_canvas{display:block; position:absolute; top:0; left:0; width:100%; height:100%;"+clientCSS+"}\n";
  for (var i=1;i<specificCSS.length;i+=2){cCSS+=(specificCSS[i]+"\n");}
  document.getElementById("backdrop_style").innerHTML=cCSS;
}
function removeChild2(element){
  for (var i=0;i<backElements.length;i++){
    if (backElements[i]==element){
      backElements.splice(i,1);
      backData.splice(i,1);
      break;
    }
  }
}
function getAll(str){
  localArray=[];
  if (str.startsWith("#")){
    var elem=document.getElementById(str.replace("#",""));
    if (elem!=null) localArray.push(document.getElementById(str.replace("#","")));
  }else if (str.startsWith("%")||str.startsWith("t:")){
    var elem=document.getElementsByClassName("backdrop_canvas");
    for (var i=0;i<elem.length;i++){
      if (str.startsWith("%") && elem[i].getAttribute("nickname")==str.replace("%","")) localArray.push(elem[i]);
      else if (elem[i].getAttribute("type")==str.replace("t:","")){localArray.push(elem[i]);}
    }
  }
  else if (str.startsWith(".")) localArray=document.getElementsByClassName(str.replace(".",""));
  else localArray=document.getElementsByTagName(str);
  return localArray;
}
function addElements(inArray,type,nick){
  for (var i=0;i<inArray.length;i++){
    var w=inArray[i].offsetWidth,h=inArray[i].offsetHeight,element=document.createElement("canvas");
    element.setAttribute("class","backdrop_canvas");
    element.setAttribute("type",type);
    element.setAttribute("nickname",nick);
    element.setAttribute("width",w);
    element.setAttribute("height",h);
    inArray[i].insertBefore(element,inArray[i].firstChild);
    backElements.push(inArray[i].getElementsByClassName("backdrop_canvas")[0]);
    if (type=="fireworks") backData.push({type: type, width: w, height: h, counter: 0, interval: 10, size: 25, sine: 0.05, dissipate: 0.2, minPoints: 3, maxPoints: 15, colors: [], array: []});
    else if (type=="boxes"){
      var sze=20,sine=0.05;
      var arr=[],arr2=[],max=Math.ceil(h/sze)*Math.ceil(w/sze);
      for (var i=0;i<max;i++){arr.push(Math.random()*Math.PI); arr2.push((sine+Math.random()*sine)/2);}
      backData.push({type: type, width: w, height: h, size: 20, sine: 0.05, minOpacity: 0.3, maxOpacity: 0.5, color: [255,255,255], boxInfo: arr, sines: arr2});
    }
    else if (type=="circles"){
      backData.push({type: type, width: w, height: h, minSize: 20, maxSize: 50, circleNo: 100, maxSpeed: 1, color: "rgba(255,255,255,0.1)", array: []});
      setCircles(backData[backData.length-1]);
    }
  }
}
function setCircles(data){for (var i=0;i<data.circleNo;i++)data.array.push({x: Math.random()*data.width, y: Math.random()*data.height, dX: Math.random()*2*data.maxSpeed-data.maxSpeed, dY: Math.random()*2*data.maxSpeed-data.maxSpeed, r: Math.random()*(data.maxSize-data.minSize)+data.minSize});}
function paintEffects(){
  var ctx;
  for (var i=0;i<backData.length;i++){
    ctx=backElements[i].getContext("2d");
    if (backData[i].type=="fireworks") paintFirework(ctx,backData[i]);
    else if (backData[i].type=="boxes") paintBoxes(ctx,backData[i]);
    else if (backData[i].type=="circles") paintSpheres(ctx,backData[i]);
  }
}
function paintFirework(ctx,data){
  var dArr=data.array;
  ctx.fillStyle="rgba(0,0,0,"+data.dissipate+")";
  ctx.fillRect(0,0,data.width,data.height);
  for (var i=0;i<dArr.length;i++){
    var dArr2=dArr[i],sn,st,func;
    ctx.fillStyle=dArr2.color;
    sn=dArr2.stepNo;
    st=dArr2.steps;
    var rot=dArr2.randRot%(360/dArr2.points)*Math.PI/18+dArr2.rotOff;
    if (dArr2.steps>0){
      for (var n=0;n<dArr2.points;n++){
        ctx.beginPath();
        func=n*2*Math.PI/dArr2.points+rot+data.sine*Math.sin(Math.pow((sn-st)+1.45,3)/100)*(-1/sn*(sn-dArr2.steps)+1);
        ctx.arc(dArr2.x+Math.cos(func)*(sn-st)*5,dArr2.y+Math.sin(func)*(sn-st)*5,st,0,2*Math.PI);
        ctx.fill();
      }
      dArr2.steps--;
    }else dArr.splice(i,1);
  }
  if (!data.counter%data.interval) addFirework(data);
  data.counter++;
}
function addFirework(data){
  var color;
  if (!data.colors.length) color="rgb("+Math.floor(Math.random()*155+100)+","+Math.floor(Math.random()*155+100)+","+Math.floor(Math.random()*155+100)+")";
  else color=data.colors[Math.floor(Math.random()*data.colors.length)];
  var tmp=Math.random()*data.size*0.5+0.5*data.size,pnts=data.minPoints+Math.floor(Math.random()*(data.maxPoints-data.minPoints+1));
  data.array.push({x: Math.random()*data.width, y: Math.random()*data.height, color: color, steps: tmp, stepNo: tmp, points: pnts, rotOff: Math.random()*10, randRot: Math.random()*10});
}
function paintBoxes(ctx,data){
  ctx.clearRect(0,0,data.width,data.height);
  var counter=0,maxW=Math.ceil(data.width/20),maxH=data.boxInfo.length/maxW,lS=data.size;
  for (var h=0;h<maxH;h++){
    for (var w=0;w<maxW;w++){
      ctx.fillStyle="rgba("+data.color[0]+","+data.color[1]+","+data.color[2]+","+(data.minOpacity+Math.sin(data.boxInfo[counter])*(data.maxOpacity-data.minOpacity))+")";
      ctx.fillRect(w*lS,h*lS,lS,lS);
      data.boxInfo[counter]+=data.sines[counter];
      counter++;
    }
  }
}
function paintSpheres(ctx,data){
  ctx.clearRect(0,0,data.width,data.height);
  ctx.fillStyle=data.color;
  var ind;
  for (var i=0;i<data.circleNo;i++){
    ind=data.array[i];
    ctx.beginPath();
    ctx.arc(ind.x,ind.y,ind.r,0,Math.PI*2);
    ctx.fill();
    ind.x+=ind.dX;
    ind.y+=ind.dY;
    if (ind.x>data.width+ind.r) ind.x=-ind.r;
    else if (ind.x<-ind.r) ind.x=data.width+ind.r;
    else if (ind.y>data.height+ind.r) ind.y=-ind.r;
    else if (ind.y<-ind.r) ind.y=data.height+ind.r;
  }
}
