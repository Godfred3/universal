import React, { useMemo } from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { Camera, Search, Users } from "lucide-react-native";


const activeUsers = [
  {
    name: "Sarah",
    image:
      "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Mike",
    image:
      "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "David",
    image:
      "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    name: "Elena",
    image:
      "https://randomuser.me/api/portraits/women/65.jpg",
  },
];


const chats = [
  {
    name: "Sarah Jenkins",
    message: "Are we still on for tonight? 🍕",
    time: "12:30 PM",
    unread: 2,
    image:
      "https://randomuser.me/api/portraits/women/44.jpg",
  },

  {
    name: "Mike Chang",
    message: "Yeah, I sent the files over earlier.",
    time: "10:15 AM",
    image:
      "https://randomuser.me/api/portraits/men/32.jpg",
    read:true
  },

  {
    name:"Design Team Sync",
    message:"Elena: Check out the new mockups!",
    time:"Yesterday",
    group:true,
    unread:5
  },

  {
    name:"David O.",
    message:"Thanks for the update. Will review.",
    time:"Yesterday",
    image:
      "https://randomuser.me/api/portraits/men/65.jpg"
  },

  {
    name:"Elena R.",
    message:"See you then!",
    time:"Monday",
    image:
      "https://randomuser.me/api/portraits/women/65.jpg"
  }
];


export default function VividMessengerScreen(){
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (

<SafeAreaView style={styles.container} edges={['top', 'bottom']}>
  <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />


{/* Header */}

<View style={styles.header}>

<TouchableOpacity>
<Camera size={26} color={theme.textSecondary} />
</TouchableOpacity>


<Text style={styles.title}>
Messages
</Text>


<TouchableOpacity>
<Search size={28} color={theme.textSecondary} />
</TouchableOpacity>


</View>



<ScrollView
showsVerticalScrollIndicator={false}
contentContainerStyle={{
paddingBottom:100
}}
>



{/* Active Users */}

<Text style={styles.sectionTitle}>
Active Now
</Text>


<ScrollView
horizontal
showsHorizontalScrollIndicator={false}
style={{marginBottom:25}}
>


{activeUsers.map((user,index)=>(

<View
key={index}
style={styles.activeUser}
>


<View style={styles.storyRing}>

<Image
source={{uri:user.image}}
style={styles.avatarSmall}
/>


<View style={styles.onlineDot}/>


</View>


<Text
numberOfLines={1}
style={styles.username}
>
{user.name}
</Text>


</View>


))}


</ScrollView>





{/* Chats */}

<Text style={styles.sectionTitle}>
Recent Chats
</Text>



{chats.map((chat,index)=>(


<TouchableOpacity
key={index}
style={styles.chatItem}
>


{chat.group ? (

<View style={styles.groupAvatar}>
<Users size={30} color={theme.textSecondary} />
</View>

):(


<Image
source={{uri:chat.image}}
style={styles.avatar}
/>


)}



<View style={styles.chatContent}>


<View style={styles.row}>

<Text style={styles.chatName}>
{chat.name}
</Text>


<Text
style={[
styles.time,
chat.unread ? styles.purpleText:{}
]}
>
{chat.time}
</Text>


</View>




<View style={styles.row}>


<Text
numberOfLines={1}
style={[
styles.message,
chat.unread ? styles.unreadMessage : undefined
]}
>

{chat.message}

</Text>



{
chat.unread &&
<View style={styles.badge}>
<Text style={styles.badgeText}>
{chat.unread}
</Text>
</View>
}


</View>



</View>



</TouchableOpacity>


))}




</ScrollView>





{/* Bottom Navigation */}




</SafeAreaView>

);

}



function Nav({
icon: Icon,
active
}:{
icon: React.ComponentType<{ size?: number; color?: string }>;
active?:boolean
}){


return(

<TouchableOpacity>

<Icon size={28} color={active ? "#7B2CBF" : "#777"} />

</TouchableOpacity>

)

}






const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({


container:{
flex:1,
backgroundColor: theme.background
},


header:{
height:65,
paddingHorizontal:20,
flexDirection:"row",
alignItems:"center",
justifyContent:"space-between",
backgroundColor: theme.background,

shadowColor: theme.textSecondary,
shadowOpacity:.08,
shadowRadius:10,
elevation:4
},


title:{
fontSize:24,
fontWeight:"700",
color: theme.primary,
fontFamily: Fonts?.sansBold,
},


sectionTitle:{
fontSize:14,
fontWeight:"600",
color: theme.textSecondary,
marginHorizontal:20,
marginTop:20,
marginBottom:15,
fontFamily: Fonts?.sansSemiBold,
},



activeUser:{
width:75,
alignItems:"center",
marginLeft:15
},


storyRing:{
width:62,
height:62,
borderRadius:31,
borderWidth:3,
borderColor: theme.primary,
alignItems:"center",
justifyContent:"center"
},


avatarSmall:{
width:52,
height:52,
borderRadius:26
},


onlineDot:{
position:"absolute",
right:0,
bottom:3,
width:15,
height:15,
backgroundColor: theme.secondary,
borderRadius:10,
borderWidth:2,
borderColor: theme.background
},


username:{
marginTop:7,
fontSize:12,
color: theme.textSecondary,
fontFamily: Fonts?.sans,
},



chatItem:{
flexDirection:"row",
alignItems:"center",
paddingHorizontal:20,
paddingVertical:10
},



avatar:{
width:58,
height:58,
borderRadius:29
},



groupAvatar:{
width:58,
height:58,
borderRadius:29,
backgroundColor: theme.backgroundElement,
justifyContent:"center",
alignItems:"center"
},



chatContent:{
flex:1,
marginLeft:15
},



row:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},



chatName:{
fontSize:17,
fontWeight:"600",
color: theme.text,
fontFamily: Fonts?.sansSemiBold,
},


time:{
fontSize:12,
color: theme.textSecondary,
fontFamily: Fonts?.sans,
},


purpleText:{
color: theme.primary,
},


message:{
fontSize:14,
color: theme.textSecondary,
marginTop:5,
flex:1,
fontFamily: Fonts?.sans,
},


unreadMessage:{
fontWeight:"600",
color: theme.text,
fontFamily: Fonts?.sansSemiBold,
},


badge:{
backgroundColor: theme.primary,
width:22,
height:22,
borderRadius:11,
justifyContent:"center",
alignItems:"center"
},


badgeText:{
color: theme.background,
fontSize:12,
fontWeight:"600",
fontFamily: Fonts?.sansBold,
},



bottomNav:{
position:"absolute",
bottom:0,
height:75,
width:"100%",
backgroundColor: theme.background,
borderTopWidth:1,
borderTopColor: theme.backgroundElement,
flexDirection:"row",
justifyContent:"space-around",
alignItems:"center"
}



});