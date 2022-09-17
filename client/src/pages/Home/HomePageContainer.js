// import GroupCard from "../../components/home/GroupCard";
// // import CategoriesTracker from '../components/home/CategoriesTracker';
//
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
//
// import { useContext, useEffect } from "react";
//
// import Category from "../../components/home/Category";
// import { ScreenSizeContext } from "../../context/ScreenSizeContext";
//
// const Home = () => {
//   const groups = useSelector((state) => state.content.groups);
//   const screenSizeContext = useContext(ScreenSizeContext);
//
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//
//   const renderCards = () => {
//     return groups.map((group) => {
//       return <Category group={group.id} key={group.id}></Category>;
//     });
//   };
//
//   const renderNoGroups = () => {
//     return (
//       <div
//         className="title"
//         onClick={() => {
//           navigate("/groups/new");
//         }}
//       >
//         <div className="new-list">Add new +</div>
//       </div>
//     );
//   };
//
//   const TasksContainer = styled.div`
//     @media (max-width: 768px) {
//       width: 100%;
//     }
//     @media (min-width: 768px) {
//       width: 60%;
//     }
//     display: inline-block;
//     position: absolute;
//     overflow-y: auto;
//     padding-right: 20px;
//     height: 100%;
//   `;
//
//   return (
//     <div className="home">
//       {/* <TasksContainer>
//                 <div className="groups-container">
//                     {groups.length !== 0 ? renderCards() : renderNoGroups()}
//                 </div>
//             </TasksContainer> */}
//       {screenSizeContext.state !== "small" && (
//         <div className="graphs">{/* <CategoriesTracker /> */}</div>
//       )}
//     </div>
//   );
// };
//
// export default Home;
