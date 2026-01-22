<template>
  <div id='popup-layer-1'></div>
  <div id='popup-layer-2'></div>
  <div id='popup-layer-3'></div>
</template>

<!--
  【存放彈窗的容器】
  最底層：popup-layer-1
  中間層：popup-layer-2
  最上層：popup-layer-3

  使用方式：
  在需要排列先後順序的彈窗組件，添加以下屬性：
  teleport-to='#popup-layer-?'
  其中?為彈窗層級，1為最底層，2為中間層，3為最上層
-->