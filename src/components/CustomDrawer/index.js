import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import UserAvatar from '../UserAvatar';

// TODO move all styles do a styled component file
const CustomDrawer = (props) => (
  <View style={{ flex: 1 }}>
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: '#003399CC' }}
    >
      <View
        style={{
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <UserAvatar
          userName="Patolino"
          style={{ height: 80, width: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text
          style={{
            color: '#fff',
            fontSize: 18,
            paddingLeft: 20,
          }}
        >
          Patolino
        </Text>
      </View>
      <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </View>
    </DrawerContentScrollView>
    <View>
      <TouchableOpacity
        onPress={() => {}}
        style={{ paddingBottom: 15, padding: 16 }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            backgroundColor: '#EEF1F4',
            borderRadius: 4,
          }}
        >
          <Text style={{ color: '#1c1c1ead', fontWeight: '500' }}>
            Sair da sessão
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

export default CustomDrawer;
