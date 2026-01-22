import ModalCard from "../../../modal/card";

const CantScreenshareModal = () => {
  return (
    <ModalCard
      title="Você não tem permissão  para compartilhar a tela"
      description="Essa funcão esta disponível apenas para o apresentador."
      confirmButton="Continuar"
    />
  );
};

export default CantScreenshareModal;
